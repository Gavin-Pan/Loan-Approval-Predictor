import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import json

# Load the dataset
df = pd.read_csv('../loanTrain.csv')

print(f"Dataset shape: {df.shape}")
print(f"\nMissing values:\n{df.isnull().sum()}")
print(f"\nLoan Status distribution:\n{df['Loan_Status'].value_counts()}")

# Handle missing values
# For categorical columns, fill with mode
categorical_cols = ['Gender', 'Married', 'Dependents', 'Self_Employed', 'Credit_History', 'Loan_Amount_Term']
for col in categorical_cols:
    if col in df.columns:
        df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown', inplace=True)

# For numerical columns, fill with median
numerical_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount']
for col in numerical_cols:
    if col in df.columns:
        df[col].fillna(df[col].median(), inplace=True)

# Create feature engineering
df['TotalIncome'] = df['ApplicantIncome'] + df['CoapplicantIncome']
df['LoanAmountLog'] = np.log(df['LoanAmount'] + 1)
df['TotalIncomeLog'] = np.log(df['TotalIncome'] + 1)
df['LoanAmountToIncome'] = df['LoanAmount'] / (df['TotalIncome'] + 1)
df['EMI'] = df['LoanAmount'] / (df['Loan_Amount_Term'] + 1)
df['IncomePerDependent'] = df['TotalIncome'] / (df['Dependents'].replace('3+', '3').astype(float) + 1)

# Encode categorical variables
label_encoders = {}
categorical_features = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']

for col in categorical_features:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# Prepare features and target
feature_columns = [
    'Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
    'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term',
    'Credit_History', 'Property_Area', 'TotalIncome', 'LoanAmountLog',
    'TotalIncomeLog', 'LoanAmountToIncome', 'EMI', 'IncomePerDependent'
]

X = df[feature_columns]
y = df['Loan_Status'].map({'Y': 1, 'N': 0})

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Train Random Forest model
print("\nTraining Random Forest model...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=10,
    min_samples_leaf=4,
    random_state=42,
    class_weight='balanced'
)

model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f"\nTrain Accuracy: {train_score:.4f}")
print(f"Test Accuracy: {test_score:.4f}")

# Get feature importances
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(f"\nTop 10 Feature Importances:\n{feature_importance.head(10)}")

# Save the model and encoders
joblib.dump(model, 'loan_model.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')
joblib.dump(feature_columns, 'feature_columns.pkl')

# Save feature importance for API
feature_importance.to_json('feature_importance.json', orient='records')

print("\n✅ Model trained and saved successfully!")
print("Files created: loan_model.pkl, label_encoders.pkl, feature_columns.pkl, feature_importance.json")
