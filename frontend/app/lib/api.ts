export interface LoanApplication {
  Gender: string;
  Married: string;
  Dependents: string;
  Education: string;
  Self_Employed: string;
  ApplicantIncome: number;
  CoapplicantIncome: number;
  LoanAmount: number;
  Loan_Amount_Term: number;
  Credit_History: number;
  Property_Area: string;
}

export interface FeatureImpact {
  feature: string;
  value: any;
  impact: number;
  direction: string;
  description: string;
}

export interface Recommendation {
  category: string;
  priority: string;
  message: string;
  action: string;
}

export interface WhatIfScenario {
  current: number;
  target: number;
  new_probability: number;
  impact: string;
}

export interface PredictionResponse {
  loan_id: string;
  approval_probability: number;
  rejection_probability: number;
  model_confidence: number;
  decision: string;
  feature_impacts: FeatureImpact[];
  recommendations: Recommendation[];
  what_if_scenarios: Record<string, WhatIfScenario>;
}

const API_URL = 'http://localhost:8000';

export async function predictLoan(application: LoanApplication): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Prediction failed');
  }

  return response.json();
}
