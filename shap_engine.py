import numpy as np
import pandas as pd
import shap
from dataset_manager import EXPECTED_PREDICTORS, CATEGORICAL_COLS, NUMERICAL_COLS
from model_trainer import load_trained_pipeline

class SHAPEngine:
    def __init__(self):
        self.pipeline_payload = load_trained_pipeline()
        self.preprocessor = self.pipeline_payload["preprocessor"]
        self.rf_model = self.pipeline_payload["base_models"]["Random Forest"]
        self.meta_learner = self.pipeline_payload["meta_learner"]
        self.feature_names = self.pipeline_payload["feature_names"]
        
        # Use TreeExplainer on Random Forest base learner for fast, exact SHAP values
        self.explainer = shap.TreeExplainer(self.rf_model)
        self.expected_value = float(self.explainer.expected_value[1]) if isinstance(self.explainer.expected_value, (list, np.ndarray)) else float(self.explainer.expected_value)

    def predict_single(self, input_dict):
        """
        Runs prediction for a single employee record.
        Returns probability, risk band, top push/pull SHAP factors, waterfall data, plain language phrases, and HR recommendations.
        """
        df_single = pd.DataFrame([input_dict])
        
        # Ensure correct column order
        df_single = df_single[EXPECTED_PREDICTORS]
        X_trans = self.preprocessor.transform(df_single)
        
        # Base models predictions
        base_preds = []
        for m_name, m_inst in self.pipeline_payload["base_models"].items():
            prob = m_inst.predict_proba(X_trans)[0, 1]
            base_preds.append(prob)
            
        # Stacking meta-learner prediction
        meta_input = np.array([base_preds])
        final_prob = float(self.meta_learner.predict_proba(meta_input)[0, 1])
        
        # Risk band mapping (PRD FR-04)
        if final_prob < 0.35:
            risk_band = "Low"
            risk_color = "success"
        elif final_prob <= 0.65:
            risk_band = "Medium"
            risk_color = "warning"
        else:
            risk_band = "High"
            risk_color = "danger"
            
        # SHAP calculation
        shap_vals = self.explainer.shap_values(X_trans)
        if isinstance(shap_vals, list):
            shap_vec = shap_vals[1][0]
        elif len(shap_vals.shape) == 3:
            shap_vec = shap_vals[0, :, 1]
        else:
            shap_vec = shap_vals[0]
            
        # Group SHAP values by original predictor fields
        predictor_shap = {}
        for idx, col in enumerate(NUMERICAL_COLS):
            predictor_shap[col] = float(shap_vec[idx])
            
        cat_encoder = self.preprocessor.named_transformers_["cat"]
        offset = len(NUMERICAL_COLS)
        for cat_col in CATEGORICAL_COLS:
            cat_shap_sum = 0.0
            categories = cat_encoder.categories_[CATEGORICAL_COLS.index(cat_col)]
            for c_idx in range(len(categories)):
                cat_shap_sum += float(shap_vec[offset])
                offset += 1
            predictor_shap[cat_col] = cat_shap_sum
            
        # Sort factors into Push (positive SHAP, increasing risk) and Pull (negative SHAP, reducing risk)
        sorted_factors = sorted(predictor_shap.items(), key=lambda x: x[1], reverse=True)
        top_push = [item for item in sorted_factors if item[1] > 0][:5]
        top_pull = [item for item in sorted_factors if item[1] < 0][-5:][::-1]
        
        # Plain-language factor translations (PRD FR-11)
        plain_push = [self.translate_factor(feat, val, input_dict[feat], True) for feat, val in top_push]
        plain_pull = [self.translate_factor(feat, val, input_dict[feat], False) for feat, val in top_pull]
        
        # Waterfall plot data payload (PRD FR-06)
        waterfall_data = []
        for feat, val in sorted_factors:
            waterfall_data.append({
                "feature": feat,
                "value": input_dict[feat],
                "shap_value": round(val, 4),
                "translation": self.translate_factor(feat, val, input_dict[feat], val > 0)
            })
            
        # HR recommendations mapped to push factors
        recommendations = self.generate_hr_recommendations(top_push, input_dict)
        
        return {
            "attrition_probability": round(final_prob, 4),
            "risk_band": risk_band,
            "risk_color": risk_color,
            "base_value": round(self.expected_value, 4),
            "top_push_factors": [{"feature": f, "shap": round(s, 4), "plain": p} for (f, s), p in zip(top_push, plain_push)],
            "top_pull_factors": [{"feature": f, "shap": round(s, 4), "plain": p} for (f, s), p in zip(top_pull, plain_pull)],
            "waterfall_data": waterfall_data,
            "recommendations": recommendations,
            "input_summary": input_dict
        }

    def translate_factor(self, feature, shap_val, raw_val, is_push):
        """Translates technical SHAP feature values into clear HR plain-language statements (PRD FR-11)."""
        if feature == "OverTime":
            return "Works regular overtime hours" if str(raw_val).lower() == "yes" else "Standard work hours (No overtime)"
        elif feature == "YearsSinceLastPromotion":
            return f"{raw_val} year(s) wait since last promotion" if raw_val >= 3 else f"Recently promoted ({raw_val} yrs ago)"
        elif feature == "MonthlyIncome":
            return f"Below median monthly salary (${raw_val:,}/mo)" if raw_val < 5000 else f"Competitive monthly salary (${raw_val:,}/mo)"
        elif feature == "DistanceFromHome":
            return f"Long commute distance ({raw_val} km)" if raw_val >= 15 else f"Convenient commute ({raw_val} km)"
        elif feature == "JobSatisfaction":
            return f"Low job satisfaction score ({raw_val}/4)" if raw_val <= 2 else f"High job satisfaction score ({raw_val}/4)"
        elif feature == "WorkLifeBalance":
            return f"Poor work-life balance score ({raw_val}/4)" if raw_val <= 2 else f"Satisfactory work-life balance ({raw_val}/4)"
        elif feature == "EnvironmentSatisfaction":
            return f"Dissatisfied with work environment ({raw_val}/4)" if raw_val <= 2 else f"Satisfied with environment ({raw_val}/4)"
        elif feature == "StockOptionLevel":
            return "Zero equity/stock option level" if raw_val == 0 else f"Allocated stock options (Level {raw_val})"
        elif feature == "YearsAtCompany":
            return f"Short tenure at company ({raw_val} yrs)" if raw_val <= 2 else f"Established company tenure ({raw_val} yrs)"
        elif feature == "NumCompaniesWorked":
            return f"High career mobility ({raw_val} previous companies)" if raw_val >= 4 else f"Stable employment history ({raw_val} previous companies)"
        elif feature == "Age":
            return f"Younger early-career demographic ({raw_val} yrs old)" if raw_val <= 28 else f"Experienced mature age bracket ({raw_val} yrs old)"
        elif feature == "TotalWorkingYears":
            return f"Limited total career experience ({raw_val} yrs)" if raw_val <= 4 else f"Extensive career experience ({raw_val} yrs)"
        else:
            direction = "elevating attrition risk" if is_push else "reducing attrition risk"
            return f"{feature} = {raw_val} ({direction})"

    def generate_hr_recommendations(self, top_push_factors, input_dict):
        """Generates actionable retention recommendations based on top push factors."""
        recs = []
        push_features = [f for f, s in top_push_factors]
        
        if "OverTime" in push_features and str(input_dict.get("OverTime")).lower() == "yes":
            recs.append({
                "title": "Workload Re-balancing & Overtime Cap",
                "action": "Offer flexible scheduling or reduce mandatory overtime hours to mitigate burnout risk.",
                "category": "Work-Life Integration"
            })
            
        if "YearsSinceLastPromotion" in push_features and input_dict.get("YearsSinceLastPromotion", 0) >= 3:
            recs.append({
                "title": "Career Advancement Review",
                "action": f"Employee has waited {input_dict.get('YearsSinceLastPromotion')} years for promotion. Schedule immediate 1-on-1 career progression roadmap review.",
                "category": "Career Growth"
            })
            
        if "MonthlyIncome" in push_features and input_dict.get("MonthlyIncome", 0) < 5500:
            recs.append({
                "title": "Compensation Band Alignment",
                "action": f"Current monthly income (${input_dict.get('MonthlyIncome'):,}) is below role median. Conduct salary band review and consider retention bonus.",
                "category": "Compensation & Benefits"
            })

        if "DistanceFromHome" in push_features and input_dict.get("DistanceFromHome", 0) >= 12:
            recs.append({
                "title": "Remote / Hybrid Flexibility",
                "action": f"Long commute ({input_dict.get('DistanceFromHome')} km). Provide hybrid work options or commuter transportation allowance.",
                "category": "Work Environment"
            })

        if "StockOptionLevel" in push_features and input_dict.get("StockOptionLevel", 0) == 0:
            recs.append({
                "title": "Equity Incentive Grant",
                "action": "Grant Stock Option Level 1+ to enhance long-term organizational attachment.",
                "category": "Retention Incentive"
            })

        if not recs:
            recs.append({
                "title": "Routine Engagement Check-in",
                "action": "Maintain periodic stay-interviews and check job satisfaction alignment.",
                "category": "General Management"
            })

        return recs

    def get_global_shap_insights(self):
        """Computes global SHAP feature importance rankings and beeswarm data across dataset."""
        df_clean = load_trained_pipeline()["X_test_raw"].copy()
        X_trans = self.preprocessor.transform(df_clean)
        
        shap_vals = self.explainer.shap_values(X_trans)
        if isinstance(shap_vals, list):
            shap_matrix = shap_vals[1]
        elif len(shap_vals.shape) == 3:
            shap_matrix = shap_vals[:, :, 1]
        else:
            shap_matrix = shap_vals
            
        # Feature importances (mean absolute SHAP)
        mean_abs_shap = np.mean(np.abs(shap_matrix), axis=0)
        
        # Group by predictor name
        grouped_importances = {}
        for idx, col in enumerate(NUMERICAL_COLS):
            grouped_importances[col] = float(mean_abs_shap[idx])
            
        cat_encoder = self.preprocessor.named_transformers_["cat"]
        offset = len(NUMERICAL_COLS)
        for cat_col in CATEGORICAL_COLS:
            cat_imp = 0.0
            categories = cat_encoder.categories_[CATEGORICAL_COLS.index(cat_col)]
            for _ in categories:
                cat_imp += float(mean_abs_shap[offset])
                offset += 1
            grouped_importances[cat_col] = cat_imp
            
        sorted_imp = sorted(grouped_importances.items(), key=lambda x: x[1], reverse=True)
        
        # Feature Dependence Sample Data
        dependence_data = {
            "OverTime": df_clean[["OverTime", "Attrition_Flag"]].to_dict(orient="records") if "Attrition_Flag" in df_clean else [],
            "YearsSinceLastPromotion": df_clean[["YearsSinceLastPromotion", "Age"]].to_dict(orient="records"),
            "MonthlyIncome": df_clean[["MonthlyIncome", "YearsAtCompany"]].to_dict(orient="records")
        }

        return {
            "feature_importance": [{"feature": f, "importance": round(imp, 4)} for f, imp in sorted_imp],
            "dependence_data": dependence_data
        }

if __name__ == "__main__":
    engine = SHAPEngine()
    test_sample = {
        "Age": 32, "MaritalStatus": "Single", "DistanceFromHome": 21, "JobRole": "Sales Executive",
        "OverTime": "Yes", "MonthlyIncome": 3200, "StockOptionLevel": 0, "JobSatisfaction": 1,
        "EnvironmentSatisfaction": 1, "WorkLifeBalance": 1, "PerformanceRating": 3,
        "TotalWorkingYears": 5, "NumCompaniesWorked": 4, "YearsAtCompany": 2, "YearsSinceLastPromotion": 3
    }
    res = engine.predict_single(test_sample)
    print("Single Prediction Result:")
    print(f"Probability: {res['attrition_probability']} | Risk Band: {res['risk_band']}")
    print(f"Top Push Factor: {res['top_push_factors'][0]['plain']}")
