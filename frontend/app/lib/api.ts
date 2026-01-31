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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001').replace(/\/$/, '');
export async function predictLoan(application: LoanApplication): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(application),
  });
  // ✅ New Error Handling (Tells you exactly what the server said)
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = 'Prediction failed';
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If server sends HTML or text instead of JSON (like a 404 or 502 error)
      errorMessage = `Server Error (${response.status}): ${text.substring(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
  // ✅ New Response Parsing (Safe)
  const data = await response.text();
  try {
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Failed to parse response. Server sent: ${data.substring(0, 100)}`);
  }
}
