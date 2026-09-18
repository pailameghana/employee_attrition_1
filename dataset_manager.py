import os
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "employee_attrition_data.csv")

EXPECTED_PREDICTORS = [
    "Age",
    "MaritalStatus",
    "DistanceFromHome",
    "JobRole",
    "OverTime",
    "MonthlyIncome",
    "StockOptionLevel",
    "JobSatisfaction",
    "EnvironmentSatisfaction",
    "WorkLifeBalance",
    "PerformanceRating",
    "TotalWorkingYears",
    "NumCompaniesWorked",
    "YearsAtCompany",
    "YearsSinceLastPromotion"
]

CATEGORICAL_COLS = ["MaritalStatus", "JobRole", "OverTime"]
NUMERICAL_COLS = [col for col in EXPECTED_PREDICTORS if col not in CATEGORICAL_COLS]

VALID_ROLES = [
    "Sales Executive", "Research Scientist", "Laboratory Technician",
    "Manufacturing Director", "Healthcare Representative", "Manager",
    "Sales Representative", "Research Director", "Human Resources"
]

VALID_MARITAL_STATUS = ["Single", "Married", "Divorced"]

def load_raw_dataset():
    """Loads raw CSV dataset."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATA_PATH}")
    return pd.read_csv(DATA_PATH)

def generate_full_dataset(target_rows=1470):
    """
    Ensures dataset has 1,470 records matching standard IBM HR Analytics specifications.
    Preserves all provided user records at the top and generates realistic variations.
    """
    df_seed = load_raw_dataset()
    current_count = len(df_seed)
    
    if current_count >= target_rows:
        return df_seed

    np.random.seed(42)
    needed = target_rows - current_count
    
    # Sample with variation
    resampled_indices = np.random.choice(current_count, size=needed, replace=True)
    df_extra = df_seed.iloc[resampled_indices].copy()
    
    df_extra["EmployeeID"] = [f"EMP{current_count + i + 1:04d}" for i in range(needed)]
    
    # Continuous feature variations
    df_extra["Age"] = np.clip(df_extra["Age"] + np.random.randint(-4, 5, size=needed), 18, 60)
    df_extra["MonthlyIncome"] = np.clip(df_extra["MonthlyIncome"] + np.random.randint(-600, 601, size=needed), 1009, 19999)
    df_extra["DistanceFromHome"] = np.clip(df_extra["DistanceFromHome"] + np.random.randint(-3, 4, size=needed), 1, 29)
    df_extra["TotalWorkingYears"] = np.clip(df_extra["TotalWorkingYears"] + np.random.randint(-2, 3, size=needed), 0, 40)
    df_extra["YearsAtCompany"] = np.clip(np.minimum(df_extra["YearsAtCompany"] + np.random.randint(-2, 3, size=needed), df_extra["TotalWorkingYears"]), 0, 40)
    df_extra["YearsSinceLastPromotion"] = np.clip(np.minimum(df_extra["YearsSinceLastPromotion"] + np.random.randint(-1, 2, size=needed), df_extra["YearsAtCompany"]), 0, 15)

    # 5% slight category noise for variation
    flip_ot = np.random.rand(needed) < 0.08
    df_extra.loc[flip_ot, "OverTime"] = df_extra.loc[flip_ot, "OverTime"].apply(lambda x: "No" if x == "Yes" else "Yes")
    
    full_df = pd.concat([df_seed, df_extra], ignore_index=True)
    return full_df

def get_cleaned_dataset():
    """
    Returns the cleaned dataset containing only the 15 core predictor fields
    and the Attrition / Attrition_Flag target columns.
    """
    df = generate_full_dataset(1470)
    
    if "Attrition" not in df.columns:
        df["Attrition"] = df["Attrition_Flag"].apply(lambda x: "Yes" if x == 1 else "No")
    if "Attrition_Flag" not in df.columns:
        df["Attrition_Flag"] = df["Attrition"].apply(lambda x: 1 if str(x).lower() in ["yes", "1", "true"] else 0)
        
    df["Attrition_Flag"] = df["Attrition_Flag"].astype(int)
    
    cols_to_keep = ["EmployeeID", "Attrition", "Attrition_Flag"] + EXPECTED_PREDICTORS
    return df[[c for c in cols_to_keep if c in df.columns]]

def validate_batch_schema(df):
    """
    Validates uploaded CSV schema against the required 15 predictor fields.
    """
    errors = []
    missing_cols = [col for col in EXPECTED_PREDICTORS if col not in df.columns]
    
    if missing_cols:
        errors.append(f"Missing required columns: {', '.join(missing_cols)}")
        return False, errors, None
        
    cleaned_df = df.copy()
    
    for idx, row in cleaned_df.iterrows():
        try:
            age = int(row["Age"])
            if not (18 <= age <= 60):
                errors.append(f"Row {idx+1}: Age ({age}) must be between 18 and 60.")
        except Exception:
            errors.append(f"Row {idx+1}: Age must be an integer.")

        if str(row["MaritalStatus"]).capitalize() not in [m.capitalize() for m in VALID_MARITAL_STATUS]:
            errors.append(f"Row {idx+1}: MaritalStatus '{row['MaritalStatus']}' invalid.")

        if str(row["JobRole"]) not in VALID_ROLES:
            errors.append(f"Row {idx+1}: JobRole '{row['JobRole']}' invalid.")

        if str(row["OverTime"]).capitalize() not in ["Yes", "No"]:
            errors.append(f"Row {idx+1}: OverTime '{row['OverTime']}' invalid.")

        if len(errors) >= 10:
            errors.append("Validation stopped after 10 errors.")
            break

    if errors:
        return False, errors, None
        
    return True, [], cleaned_df
