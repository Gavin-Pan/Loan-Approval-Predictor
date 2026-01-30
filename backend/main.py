from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import json

app = FastAPI(title="Loan Approval Predictor API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and encoders
try:
    model = joblib.load('loan_model.pkl')
    label_encoders = joblib.load('label_encoders.pkl')
    feature_columns = joblib.load('feature_columns.pkl')
    with open('feature_importance.json', 'r') as f:
        feature_importance_data = json.load(f)
    print("✅ Model and encoders loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Pydantic models for request/response
class LoanApplication(BaseModel):
    Gender: str = Field(..., description="Male or Female")
    Married: str = Field(..., description="Yes or No")
    Dependents: str = Field(..., description="0, 1, 2, or 3+")
    Education: str = Field(..., description="Graduate or Not Graduate")
    Self_Employed: str = Field(..., description="Yes or No")
    ApplicantIncome: float = Field(..., gt=0, description="Applicant's income")
    CoapplicantIncome: float = Field(default=0, ge=0, description="Coapplicant's income")
    LoanAmount: float = Field(..., gt=0, description="Loan amount in thousands")
    Loan_Amount_Term: float = Field(..., gt=0, description="Loan term in months")
    Credit_History: int = Field(..., ge=0, le=1, description="1 for good credit, 0 for bad")
    Property_Area: str = Field(..., description="Urban, Semiurban, or Rural")

class FeatureImpact(BaseModel):
    feature: str
    value: Any
    impact: float
    direction: str
    description: str

class Recommendation(BaseModel):
    category: str
    priority: str
    message: str
    action: str

class WhatIfScenario(BaseModel):
    current: float
    target: float
    new_probability: float
    impact: str

class PredictionResponse(BaseModel):
    loan_id: str
    approval_probability: float
    rejection_probability: float
    model_confidence: float
    decision: str
    feature_impacts: List[FeatureImpact]
    recommendations: List[Recommendation]
    what_if_scenarios: Dict[str, WhatIfScenario]

def encode_input(data: dict, encoders: dict) -> dict:
    """Encode categorical inputs using saved label encoders"""
    encoded = data.copy()
    for col, encoder in encoders.items():
        if col in encoded:
            try:
                # Handle unknown categories
                if str(encoded[col]) in encoder.classes_:
                    encoded[col] = encoder.transform([str(encoded[col])])[0]
                else:
                    # Use most common class for unknown values
                    encoded[col] = encoder.transform([encoder.classes_[0]])[0]
            except Exception as e:
                print(f"Error encoding {col}: {e}")
                encoded[col] = 0
    return encoded

def create_features(data: dict) -> pd.DataFrame:
    """Create engineered features from input data"""
    df = pd.DataFrame([data])
    
    # Feature engineering (same as training)
    df['TotalIncome'] = df['ApplicantIncome'] + df['CoapplicantIncome']
    df['LoanAmountLog'] = np.log(df['LoanAmount'] + 1)
    df['TotalIncomeLog'] = np.log(df['TotalIncome'] + 1)
    df['LoanAmountToIncome'] = df['LoanAmount'] / (df['TotalIncome'] + 1)
    df['EMI'] = df['LoanAmount'] / (df['Loan_Amount_Term'] + 1)
    
    # Handle Dependents conversion
    dependents_val = str(data['Dependents']).replace('3+', '3')
    try:
        dependents_num = float(dependents_val)
    except:
        dependents_num = 0
    
    df['IncomePerDependent'] = df['TotalIncome'] / (dependents_num + 1)
    
    return df

def generate_feature_impacts(input_data: dict, prediction_proba: np.ndarray, feature_names: list) -> List[FeatureImpact]:
    """Generate feature impact analysis"""
    impacts = []
    
    # Get feature importance from trained model
    feature_imp_dict = {item['feature']: item['importance'] for item in feature_importance_data}
    
    # Map features to human-readable descriptions
    feature_descriptions = {
        'Credit_History': 'Credit history is a strong indicator of loan repayment reliability',
        'TotalIncome': 'Combined income affects loan repayment capacity',
        'LoanAmount': 'Loan amount relative to income impacts approval',
        'ApplicantIncome': 'Primary applicant income supports loan repayment',
        'CoapplicantIncome': 'Additional income strengthens application',
        'LoanAmountToIncome': 'Loan-to-income ratio is a key risk metric',
        'EMI': 'Monthly EMI affects repayment feasibility',
        'Education': 'Education level correlates with income stability',
        'Property_Area': 'Property location affects loan risk assessment',
        'Married': 'Marital status indicates financial stability',
        'Self_Employed': 'Employment type affects income predictability',
        'Loan_Amount_Term': 'Loan term affects monthly payment burden',
        'Dependents': 'Number of dependents impacts financial obligations',
        'Gender': 'Demographic factor in risk assessment',
    }
    
    # Get top features by importance
    top_features = sorted(feature_imp_dict.items(), key=lambda x: x[1], reverse=True)[:8]
    
    for feature, importance in top_features:
        if feature in input_data:
            value = input_data[feature]
            
            # Determine impact direction based on feature and value
            direction = "positive"
            impact_score = importance
            
            # Adjust direction based on feature values
            if feature == 'Credit_History' and value == 0:
                direction = "negative"
                impact_score = -importance
            elif feature in ['LoanAmount', 'LoanAmountToIncome', 'EMI']:
                # Higher values are typically negative
                direction = "negative" if value > input_data.get('TotalIncome', 0) * 0.3 else "positive"
                impact_score = -importance if direction == "negative" else importance
            
            impacts.append(FeatureImpact(
                feature=feature,
                value=value,
                impact=round(impact_score, 3),
                direction=direction,
                description=feature_descriptions.get(feature, f"{feature} affects loan approval")
            ))
    
    return impacts

def generate_recommendations(input_data: dict, decision: str, feature_impacts: List[FeatureImpact]) -> List[Recommendation]:
    """Generate personalized recommendations"""
    recommendations = []
    
    if decision == "approved":
        recommendations.append(Recommendation(
            category="credit",
            priority="high",
            message="Maintain excellent credit history",
            action="Continue making timely payments on all debts to preserve your good standing"
        ))
        
        if input_data.get('CoapplicantIncome', 0) > 0:
            recommendations.append(Recommendation(
                category="income",
                priority="medium",
                message="Strong dual-income application",
                action="Keep both income sources documented for future applications"
            ))
        
        recommendations.append(Recommendation(
            category="financial",
            priority="low",
            message="Consider loan insurance",
            action="Protect your loan with insurance to cover unexpected events"
        ))
    else:
        # Rejected - provide improvement suggestions
        if input_data.get('Credit_History', 1) == 0:
            recommendations.append(Recommendation(
                category="credit",
                priority="high",
                message="Improve credit history immediately",
                action="Pay all outstanding debts and maintain 6+ months of clean credit history"
            ))
        
        loan_to_income = input_data.get('LoanAmount', 0) / (input_data.get('ApplicantIncome', 1) + input_data.get('CoapplicantIncome', 0) + 1)
        if loan_to_income > 0.3:
            recommendations.append(Recommendation(
                category="loan",
                priority="high",
                message="Reduce loan amount or increase income",
                action=f"Consider reducing loan to {int(input_data.get('LoanAmount', 0) * 0.7)}k or add a coapplicant"
            ))
        
        if input_data.get('CoapplicantIncome', 0) == 0:
            recommendations.append(Recommendation(
                category="income",
                priority="medium",
                message="Add a coapplicant to strengthen application",
                action="Including a coapplicant with stable income can significantly improve approval chances"
            ))
    
    return recommendations

def generate_what_if_scenarios(input_data: dict, current_prob: float) -> Dict[str, WhatIfScenario]:
    """Generate what-if scenarios"""
    scenarios = {}
    
    # Scenario 1: Improve credit history
    if input_data.get('Credit_History', 1) == 0:
        scenarios['improve_credit_history'] = WhatIfScenario(
            current=0,
            target=1,
            new_probability=min(current_prob + 25.0, 95.0),
            impact="+25%"
        )
    
    # Scenario 2: Add/increase coapplicant income
    current_coapp = input_data.get('CoapplicantIncome', 0)
    target_coapp = max(current_coapp * 1.5, input_data.get('ApplicantIncome', 0) * 0.5)
    scenarios['increase_coapplicant_income'] = WhatIfScenario(
        current=current_coapp,
        target=round(target_coapp, 2),
        new_probability=min(current_prob + 8.0, 95.0),
        impact="+8%"
    )
    
    # Scenario 3: Reduce loan amount
    current_loan = input_data.get('LoanAmount', 0)
    target_loan = current_loan * 0.75
    scenarios['reduce_loan_amount'] = WhatIfScenario(
        current=current_loan,
        target=round(target_loan, 2),
        new_probability=min(current_prob + 6.0, 95.0),
        impact="+6%"
    )
    
    return scenarios

@app.get("/")
def root():
    return {
        "message": "Loan Approval Predictor API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None
    }

@app.post("/api/predict", response_model=PredictionResponse)
def predict_loan(application: LoanApplication):
    """Predict loan approval probability"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Convert to dict
        input_data = application.dict()
        
        # Encode categorical variables
        encoded_data = encode_input(input_data, label_encoders)
        
        # Create features
        features_df = create_features(encoded_data)
        
        # Select only the features used in training
        X = features_df[feature_columns]
        
        # Make prediction
        prediction_proba = model.predict_proba(X)[0]
        approval_prob = float(prediction_proba[1] * 100)
        rejection_prob = float(prediction_proba[0] * 100)
        
        # Determine decision (threshold at 50%)
        decision = "approved" if approval_prob >= 50 else "rejected"
        
        # Model confidence (distance from 50%)
        confidence = abs(approval_prob - 50) + 50
        
        # Generate feature impacts
        feature_impacts = generate_feature_impacts(encoded_data, prediction_proba, feature_columns)
        
        # Generate recommendations
        recommendations = generate_recommendations(input_data, decision, feature_impacts)
        
        # Generate what-if scenarios
        what_if_scenarios = generate_what_if_scenarios(input_data, approval_prob)
        
        # Generate loan ID
        loan_id = f"LP{hash(str(input_data)) % 1000000:06d}"
        
        return PredictionResponse(
            loan_id=loan_id,
            approval_probability=round(approval_prob, 1),
            rejection_probability=round(rejection_prob, 1),
            model_confidence=round(confidence, 1),
            decision=decision,
            feature_impacts=feature_impacts,
            recommendations=recommendations,
            what_if_scenarios=what_if_scenarios
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features_count": len(feature_columns) if feature_columns else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
