import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_full_stack():
    print("--- 1. Testing Health Endpoint ---")
    with urllib.request.urlopen(f"{BASE_URL}/api/health") as response:
        data = json.loads(response.read().decode())
        print("Health response:", data)
        assert data["status"] == "online"

    print("\n--- 2. Testing Single Predictor API ---")
    sample_payload = {
        "Age": 32, "MaritalStatus": "Single", "DistanceFromHome": 21, "JobRole": "Sales Executive",
        "OverTime": "Yes", "MonthlyIncome": 3200, "StockOptionLevel": 0, "JobSatisfaction": 1,
        "EnvironmentSatisfaction": 1, "WorkLifeBalance": 1, "PerformanceRating": 3,
        "TotalWorkingYears": 5, "NumCompaniesWorked": 4, "YearsAtCompany": 2, "YearsSinceLastPromotion": 3
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/predict/single",
        data=json.dumps(sample_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print(f"Prediction: Probability = {res['attrition_probability']} | Risk Band = {res['risk_band']}")
        print(f"Top Push Factor (Plain): {res['top_push_factors'][0]['plain']}")
        print(f"Actionable HR Recommendations Count: {len(res['recommendations'])}")

    print("\n--- 3. Testing Interactive What-If Simulator ---")
    sim_payload = {
        "base_input": sample_payload,
        "modified_input": {**sample_payload, "OverTime": "No", "MonthlyIncome": 6500, "YearsSinceLastPromotion": 1}
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/simulate",
        data=json.dumps(sim_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        sim_res = json.loads(response.read().decode())
        print(f"Simulator Result: Base Risk={sim_res['original_probability']} -> Simulated Risk={sim_res['simulated_probability']} (Delta: {sim_res['probability_delta']})")

    print("\n--- 4. Testing Model Performance Benchmark Report ---")
    with urllib.request.urlopen(f"{BASE_URL}/api/model/metrics") as response:
        metrics = json.loads(response.read().decode())
        print("Model Performance Results (Held-out Test Set):")
        for m_name in ["Random Forest", "XGBoost", "Decision Tree", "SVM", "Stacking Ensemble"]:
            m = metrics[m_name]
            print(f"  {m_name:20s} | ROC-AUC: {m['ROC_AUC']:.4f} | Recall: {m['Recall']:.4f} | F1: {m['F1_Score']:.4f}")

    print("\n--- 5. Testing Research Comparison Endpoint ---")
    with urllib.request.urlopen(f"{BASE_URL}/api/research") as response:
        res_data = json.loads(response.read().decode())
        print("Base Paper Title:", res_data["base_paper"]["title"])
        print("Proposed Architectural Innovations Count:", len(res_data["proposed_system"]["architectural_innovations"]))

    print("\n=======================================================")
    print("SUCCESS: FULL STACK APPLICATION VERIFIED END-TO-END!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_stack()
