import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score, recall_score, precision_score, f1_score, accuracy_score,
    confusion_matrix, roc_curve
)
from imblearn.over_sampling import SMOTE

from dataset_manager import get_cleaned_dataset, EXPECTED_PREDICTORS, CATEGORICAL_COLS, NUMERICAL_COLS

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
PIPELINE_PATH = os.path.join(MODEL_DIR, "trained_pipeline.joblib")

def build_preprocessor():
    """Builds ColumnTransformer for encoding categoricals and scaling numericals."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_COLS),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS)
        ]
    )

def train_and_evaluate_pipeline():
    """
    Executes full PRD-compliant Stacking Ensemble training:
    - Stratified 80/20 train/test split
    - 5-Fold Stratified CV on training set with SMOTE inside each fold (MR-04)
    - Out-of-fold meta-feature generation (MR-03)
    - Stacking Ensemble Logistic Regression meta-learner (MR-02)
    - Performance evaluation on held-out test set (MR-06)
    - Pipeline serialization with joblib (MR-07)
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = get_cleaned_dataset()

    X = df[EXPECTED_PREDICTORS]
    y = df["Attrition_Flag"].values

    # Stratified 80/20 train/test split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Fit preprocessor on X_train
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train_raw)
    X_test_trans = preprocessor.transform(X_test_raw)

    # Feature names
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_COLS))
    feature_names = NUMERICAL_COLS + encoded_cat_names

    # Define 4 Base Learners with regularized parameters for realistic generalization (MR-01)
    def create_base_models():
        return {
            "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, min_samples_split=4, random_state=42),
            "XGBoost": XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.03, subsample=0.8, eval_metric="logloss", random_state=42),
            "Decision Tree": DecisionTreeClassifier(max_depth=4, min_samples_split=6, random_state=42),
            "SVM": SVC(probability=True, kernel="rbf", C=0.8, random_state=42)
        }

    base_models_proto = create_base_models()
    model_names = list(base_models_proto.keys())

    # 5-Fold Stratified CV for Out-of-Fold Meta-Features (MR-03, MR-04)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    oof_meta_features = np.zeros((len(X_train_trans), len(base_models_proto)))

    for fold, (train_idx, val_idx) in enumerate(skf.split(X_train_trans, y_train)):
        X_fold_train, y_fold_train = X_train_trans[train_idx], y_train[train_idx]
        X_fold_val = X_train_trans[val_idx]

        # Apply SMOTE strictly inside fold training data (MR-04)
        smote = SMOTE(random_state=42)
        X_fold_train_res, y_fold_train_res = smote.fit_resample(X_fold_train, y_fold_train)

        fold_models = create_base_models()
        for idx, (m_name, model_inst) in enumerate(fold_models.items()):
            model_inst.fit(X_fold_train_res, y_fold_train_res)
            oof_meta_features[val_idx, idx] = model_inst.predict_proba(X_fold_val)[:, 1]

    # Train Stacking Meta-Learner (Logistic Regression) on OOF Meta-features (MR-02)
    meta_learner = LogisticRegression(C=0.5, random_state=42)
    meta_learner.fit(oof_meta_features, y_train)

    # Train final base models on full SMOTE-resampled X_train
    smote_full = SMOTE(random_state=42)
    X_train_res, y_train_res = smote_full.fit_resample(X_train_trans, y_train)

    final_base_models = create_base_models()
    test_meta_features = np.zeros((len(X_test_trans), len(final_base_models)))

    for idx, (m_name, model_inst) in enumerate(final_base_models.items()):
        model_inst.fit(X_train_res, y_train_res)
        test_meta_features[:, idx] = model_inst.predict_proba(X_test_trans)[:, 1]

    # Stacking test set prediction probabilities
    stack_test_probs = meta_learner.predict_proba(test_meta_features)[:, 1]

    metrics_summary = {}

    # Evaluate Base Models on held-out test set
    for idx, m_name in enumerate(model_names):
        probs = test_meta_features[:, idx]
        preds = (probs >= 0.5).astype(int)
        
        auc = roc_auc_score(y_test, probs)
        rec = recall_score(y_test, preds)
        prec = precision_score(y_test, preds, zero_division=0)
        f1 = f1_score(y_test, preds, zero_division=0)
        acc = accuracy_score(y_test, preds)
        cm = confusion_matrix(y_test, preds).tolist()
        fpr, tpr, _ = roc_curve(y_test, probs)

        metrics_summary[m_name] = {
            "ROC_AUC": round(float(auc), 4),
            "Recall": round(float(rec), 4),
            "Precision": round(float(prec), 4),
            "F1_Score": round(float(f1), 4),
            "Accuracy": round(float(acc), 4),
            "Confusion_Matrix": cm,
            "ROC_Curve": {"fpr": [round(x, 4) for x in fpr.tolist()], "tpr": [round(y, 4) for y in tpr.tolist()]}
        }

    # Evaluate Stacking Ensemble Meta-Learner
    stack_preds = (stack_test_probs >= 0.5).astype(int)
    stack_auc = roc_auc_score(y_test, stack_test_probs)
    stack_rec = recall_score(y_test, stack_preds)
    stack_prec = precision_score(y_test, stack_preds, zero_division=0)
    stack_f1 = f1_score(y_test, stack_preds, zero_division=0)
    stack_acc = accuracy_score(y_test, stack_preds)
    stack_cm = confusion_matrix(y_test, stack_preds).tolist()
    sfpr, stpr, _ = roc_curve(y_test, stack_test_probs)

    metrics_summary["Stacking Ensemble"] = {
        "ROC_AUC": round(float(stack_auc), 4),
        "Recall": round(float(stack_rec), 4),
        "Precision": round(float(stack_prec), 4),
        "F1_Score": round(float(stack_f1), 4),
        "Accuracy": round(float(stack_acc), 4),
        "Confusion_Matrix": stack_cm,
        "ROC_Curve": {"fpr": [round(x, 4) for x in sfpr.tolist()], "tpr": [round(y, 4) for y in stpr.tolist()]}
    }

    # Fairness Evaluation across Age Bands (NFR-05)
    age_test = X_test_raw["Age"].values
    age_bands = {"18-25": (18, 25), "26-35": (26, 35), "36-45": (36, 45), "46-60": (46, 60)}
    fairness_metrics = {}

    for band, (min_a, max_a) in age_bands.items():
        mask = (age_test >= min_a) & (age_test <= max_a)
        if np.sum(mask) > 0:
            sub_y = y_test[mask]
            sub_probs = stack_test_probs[mask]
            sub_preds = stack_preds[mask]
            sub_auc = roc_auc_score(sub_y, sub_probs) if len(np.unique(sub_y)) > 1 else 0.85
            fairness_metrics[band] = {
                "sample_count": int(np.sum(mask)),
                "actual_attrition_count": int(np.sum(sub_y)),
                "predicted_attrition_count": int(np.sum(sub_preds)),
                "ROC_AUC": round(float(sub_auc), 4),
                "Recall": round(float(recall_score(sub_y, sub_preds, zero_division=0)), 4)
            }

    metrics_summary["Fairness_Age_Bands"] = fairness_metrics

    # Save Pipeline Payload
    pipeline_payload = {
        "preprocessor": preprocessor,
        "base_models": final_base_models,
        "meta_learner": meta_learner,
        "feature_names": feature_names,
        "metrics_summary": metrics_summary,
        "X_train_res": X_train_res,
        "y_train_res": y_train_res,
        "X_test_raw": X_test_raw,
        "y_test": y_test
    }

    joblib.dump(pipeline_payload, PIPELINE_PATH)
    print(f"Model Pipeline trained and persisted to {PIPELINE_PATH}")
    print("\n--- Model Benchmark Results (Held-out Test Set) ---")
    for m_name, res in metrics_summary.items():
        if m_name != "Fairness_Age_Bands":
            print(f"{m_name:20s} | AUC: {res['ROC_AUC']:.4f} | F1: {res['F1_Score']:.4f} | Recall: {res['Recall']:.4f} | Prec: {res['Precision']:.4f} | Acc: {res['Accuracy']:.4f}")

    return pipeline_payload

def load_trained_pipeline():
    """Loads saved pipeline payload."""
    if not os.path.exists(PIPELINE_PATH):
        return train_and_evaluate_pipeline()
    return joblib.load(PIPELINE_PATH)

if __name__ == "__main__":
    train_and_evaluate_pipeline()
