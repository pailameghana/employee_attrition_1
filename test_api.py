from dataset_manager import get_cleaned_dataset, validate_batch_schema
from shap_engine import SHAPEngine
from model_trainer import load_trained_pipeline
from main import get_research_comparison, get_model_metrics

def test_backend_direct():
    print("1. Testing Dataset Manager...")
    df = get_cleaned_dataset()
    print(f"Dataset shape: {df.shape}")
    assert df.shape[0] == 1470

    print("\n2. Testing SHAP Engine...")
    engine = SHAPEngine()
    sample_input = {
        "Age": 35, "MaritalStatus": "Single", "DistanceFromHome": 27, "JobRole": "Sales Executive",
        "OverTime": "Yes", "MonthlyIncome": 5813, "StockOptionLevel": 0, "JobSatisfaction": 4,
        "EnvironmentSatisfaction": 3, "WorkLifeBalance": 3, "PerformanceRating": 3,
        "TotalWorkingYears": 10, "NumCompaniesWorked": 1, "YearsAtCompany": 10, "YearsSinceLastPromotion": 7
    }
    res = engine.predict_single(sample_input)
    print(f"Prediction result: Probability={res['attrition_probability']}, Risk Band={res['risk_band']}")
    assert "attrition_probability" in res
    assert "top_push_factors" in res
    assert len(res["recommendations"]) > 0

    print("\n3. Testing Model Metrics Endpoint...")
    metrics = get_model_metrics()
    print("Evaluated Models:", list(metrics.keys()))
    assert "Stacking Ensemble" in metrics

    print("\n4. Testing Research Comparison Endpoint...")
    res_comp = get_research_comparison()
    print("Base paper title:", res_comp["base_paper"]["title"])
    assert len(res_comp["base_paper"]["limitations"]) > 0

    print("\nALL BACKEND LOGIC VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_backend_direct()
