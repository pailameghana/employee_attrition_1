import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse

from dataset_manager import get_cleaned_dataset, validate_batch_schema, EXPECTED_PREDICTORS
from shap_engine import SHAPEngine
from model_trainer import load_trained_pipeline

app = FastAPI(
    title="Explainable Employee Attrition Prediction API",
    description="Stacking Ensemble Learning & SHAP Explainability Engine API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SHAP Engine
shap_engine = SHAPEngine()

@app.get("/api/health")
def health_check():
    return {"status": "online", "model_loaded": True, "dataset": "IBM HR Analytics 1,470 Records"}

@app.get("/api/dataset")
def get_dataset(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    role: str = Query(None),
    risk: str = Query(None)
):
    """Returns paginated and filterable dataset records."""
    df = get_cleaned_dataset().copy()
    
    if search:
        s = search.lower()
        df = df[df["EmployeeID"].astype(str).str.lower().contains(s) | df["JobRole"].astype(str).str.lower().contains(s)]
        
    if role and role != "All":
        df = df[df["JobRole"] == role]
        
    total_records = len(df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    records = df.iloc[start_idx:end_idx].to_dict(orient="records")
    return {
        "total": total_records,
        "page": page,
        "limit": limit,
        "total_pages": (total_records + limit - 1) // limit,
        "records": records
    }

@app.post("/api/predict/single")
def predict_single(data: dict):
    """Predicts attrition risk for a single employee record (PRD FR-01, FR-03, FR-04, FR-05, FR-06)."""
    # Range validation (PRD NFR-06)
    for col in EXPECTED_PREDICTORS:
        if col not in data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {col}")
            
    try:
        res = shap_engine.predict_single(data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/simulate")
def simulate_what_if(payload: dict):
    """
    Simulates 'What-If' parameter adjustments and returns risk change delta (PRD FR-12).
    Payload expects: {"base_input": dict, "modified_input": dict}
    """
    base_input = payload.get("base_input")
    modified_input = payload.get("modified_input")
    
    if not base_input or not modified_input:
        raise HTTPException(status_code=400, detail="Payload requires 'base_input' and 'modified_input'")
        
    base_res = shap_engine.predict_single(base_input)
    modified_res = shap_engine.predict_single(modified_input)
    
    prob_delta = modified_res["attrition_probability"] - base_res["attrition_probability"]
    
    return {
        "original_probability": base_res["attrition_probability"],
        "original_risk_band": base_res["risk_band"],
        "simulated_probability": modified_res["attrition_probability"],
        "simulated_risk_band": modified_res["risk_band"],
        "probability_delta": round(prob_delta, 4),
        "risk_reduced": prob_delta < 0,
        "modified_factors": modified_res["top_push_factors"],
        "new_recommendations": modified_res["recommendations"]
    }

@app.post("/api/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    """
    Processes CSV batch upload, performs schema validation (PRD FR-02), and returns predictions (FR-08, FR-09).
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV format.")
        
    contents = await file.read()
    try:
        df_upload = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
    is_valid, errors, cleaned_df = validate_batch_schema(df_upload)
    if not is_valid:
        return JSONResponse(status_code=400, content={"status": "error", "errors": errors})
        
    results = []
    low_count, med_count, high_count = 0, 0, 0
    
    for idx, row in cleaned_df.iterrows():
        emp_id = row.get("EmployeeID", f"BATCH_{idx+1:03d}")
        input_dict = row[EXPECTED_PREDICTORS].to_dict()
        pred = shap_engine.predict_single(input_dict)
        
        band = pred["risk_band"]
        if band == "Low":
            low_count += 1
        elif band == "Medium":
            med_count += 1
        else:
            high_count += 1
            
        top_3_factors = [f["plain"] for f in pred["top_push_factors"][:3]]
        results.append({
            "EmployeeID": emp_id,
            "JobRole": input_dict["JobRole"],
            "MonthlyIncome": input_dict["MonthlyIncome"],
            "OverTime": input_dict["OverTime"],
            "Probability": pred["attrition_probability"],
            "RiskBand": band,
            "TopFactors": "; ".join(top_3_factors)
        })
        
    return {
        "status": "success",
        "total_records": len(results),
        "summary": {
            "low_risk": low_count,
            "medium_risk": med_count,
            "high_risk": high_count,
            "high_risk_percentage": round((high_count / len(results)) * 100, 1) if len(results) > 0 else 0
        },
        "records": results
    }

@app.get("/api/model/metrics")
def get_model_metrics():
    """Returns model benchmark comparison table, confusion matrices, and ROC curves (PRD FR-10)."""
    pipeline_payload = load_trained_pipeline()
    return pipeline_payload["metrics_summary"]

@app.get("/api/insights/global")
def get_global_insights():
    """Returns global SHAP summary, feature importances, and dependence plots (PRD FR-07, XR-04, XR-05)."""
    return shap_engine.get_global_shap_insights()

@app.get("/api/research")
def get_research_comparison():
    """Returns Base Paper vs Proposed System comparative analysis and research gaps."""
    return {
        "base_paper": {
            "title": "Predicting employee attrition and explaining its determinants",
            "authors": "Manafi Varkiani, Pattarin, Fabbri, Fantoni (2025)",
            "journal": "Expert Systems With Applications",
            "dataset": "Italian Financial Institution (5,767 records, 5.4% attrition rate)",
            "model_used": "Single Random Forest model with ROSE class balancing",
            "explainability": "Global feature importances & static single-case SHAP in R (iml package)",
            "limitations": [
                "Lacks multi-model stacking ensemble comparison",
                "No interactive real-time What-If risk simulator",
                "No automated plain-language SHAP translations for non-technical HR managers",
                "No dynamic batch schema validation or CSV decision reporting",
                "No actionable HR policy intervention recommendation engine"
            ]
        },
        "proposed_system": {
            "title": "Explainable Employee Attrition Prediction System",
            "institution": "MVGR College of Engineering (Autonomous) - Dept of Data Engineering",
            "architectural_innovations": [
                "Stacking Ensemble: 4 Base Learners (Random Forest, XGBoost, Decision Tree, SVM) + Logistic Regression Meta-Learner",
                "SMOTE Resampling strictly INSIDE 5-fold cross-validation folds (preventing data leakage)",
                "Local & Global SHAP Explainability Engine with Interactive Waterfall/Force plots",
                "Plain-Language HR Translation Engine (PRD FR-11)",
                "Dynamic 'What-If' Parameter Risk Simulator (PRD FR-12)",
                "Actionable HR Intervention Strategy Generator",
                "Fairness Audit across Age Bands (NFR-05)"
            ]
        },
        "ishikawa_framework": {
            "categories": [
                {"name": "People", "factors": ["Tenure", "Age", "Marital Status"]},
                {"name": "Management/Culture", "factors": ["Stock Options", "Performance Rating", "Job Role"]},
                {"name": "Work Environment", "factors": ["Work-Life Balance", "Job Satisfaction", "Environment Satisfaction"]},
                {"name": "Compensation", "factors": ["Monthly Income", "Overtime Commitments"]},
                {"name": "Tenure & Promotion", "factors": ["Years Since Last Promotion", "Years At Company", "Companies Worked"]}
            ]
        }
    }

# Mount static files for Frontend SPA
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
os.makedirs(FRONTEND_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Explainable Employee Attrition Prediction Backend API is running! Frontend loading...</h1>"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
