'use client';

import { useState } from 'react';
import { LoanApplication, PredictionResponse, predictLoan } from './lib/api';

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [formData, setFormData] = useState<LoanApplication>({
    Gender: 'Male',
    Married: 'Yes',
    Dependents: '0',
    Education: 'Graduate',
    Self_Employed: 'No',
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 150,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: 'Urban',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoanApplication) => ({
      ...prev,
      [name]: ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const prediction = await predictLoan(formData);
      setResult(prediction);
      setStep(5);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
  };

  if (result) {
    return (
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-center mb-xl">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              🏦 Loan Approval Predictor
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
              Application ID: {result.loan_id}
            </p>
          </div>

          {/* Approval Status Banner */}
          <div className="card mb-xl" style={{
            background: result.decision === 'approved' 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.1) 100%)',
            border: result.decision === 'approved'
              ? '2px solid var(--color-success)'
              : '2px solid var(--color-danger)',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {result.decision === 'approved' ? '✅' : '❌'}
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              LOAN {result.decision.toUpperCase()}
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
              {result.decision === 'approved' 
                ? 'Congratulations! Your application shows strong approval likelihood.'
                : 'Your application needs improvement. See recommendations below.'}
            </p>
          </div>

          {/* Probability Cards */}
          <div className="grid grid-3 mb-xl">
            <div className="card card-glass">
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                📊 Approval Probability
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {result.approval_probability.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success-light)', marginTop: '0.25rem' }}>
                ↑ {result.approval_probability > 50 ? 'High confidence' : 'Needs improvement'}
              </div>
            </div>

            <div className="card card-glass">
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                ⚠️ Rejection Probability
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                {result.rejection_probability.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-danger-light)', marginTop: '0.25rem' }}>
                {result.rejection_probability < 50 ? 'Low risk' : 'High risk'}
              </div>
            </div>

            <div className="card card-glass">
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                🎯 Model Confidence
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {result.model_confidence.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', marginTop: '0.25rem' }}>
                Prediction reliability
              </div>
            </div>
          </div>

          {/* Feature Impact Analysis */}
          <div className="card mb-xl">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📈 Feature Impact Analysis
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Feature</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Value</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Impact</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {result.feature_impacts.map((impact: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{impact.feature}</td>
                      <td style={{ padding: '1rem' }}>{typeof impact.value === 'number' ? impact.value.toFixed(2) : impact.value}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${impact.direction === 'positive' ? 'badge-success' : 'badge-danger'}`}>
                          {impact.direction === 'positive' ? '↑' : '↓'} {Math.abs(impact.impact).toFixed(3)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {impact.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card mb-xl">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💡 {result.decision === 'approved' ? 'Ways to Maintain/Improve' : 'Priority Action Items'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="card-glass" style={{ padding: '1.5rem', borderLeft: `4px solid ${
                  rec.priority === 'high' ? 'var(--color-danger)' : 
                  rec.priority === 'medium' ? 'var(--color-warning)' : 
                  'var(--color-success)'
                }` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1.125rem', marginBottom: 0 }}>{rec.message}</h4>
                    <span className={`badge ${
                      rec.priority === 'high' ? 'badge-danger' : 
                      rec.priority === 'medium' ? 'badge-warning' : 
                      'badge-success'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>{rec.action}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Category: {rec.category}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What-If Scenarios */}
          <div className="card mb-xl">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔮 What-If Scenarios
            </h3>
            <div className="grid grid-3">
              {Object.entries(result.what_if_scenarios).map(([key, scenario]: [string, any]) => (
                <div key={key} className="card-glass" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Current</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{scenario.current}</div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Target</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>{scenario.target}</div>
                  </div>
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-primary)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>New Probability</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {scenario.new_probability.toFixed(1)}%
                      <span style={{ fontSize: '0.875rem', marginLeft: '0.5rem', color: 'var(--color-success)' }}>
                        {scenario.impact}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={resetForm} className="btn btn-primary btn-lg">
              📝 New Application
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {loading && (
        <div className="loading-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ fontSize: '1.125rem' }}>Analyzing your application...</p>
          </div>
        </div>
      )}

      <div className="animate-fade-in">
        {/* Header */}
        <div className="text-center mb-xl">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🏦 Loan Approval Predictor
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
            This machine learning-powered tool analyzes your financial profile and predicts loan approval likelihood
          </p>
        </div>

        {/* Info Banner */}
        <div className="card card-glass mb-xl" style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid var(--color-primary)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ℹ️ How it works
          </h3>
          <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>
            Fill out the form below to get instant results with personalized recommendations. 
            The tool uses advanced machine learning to provide accurate predictions based on your financial data.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-lg">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card mb-xl">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="animate-slide-in">
                <h3 className="mb-lg">👤 Personal Information</h3>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="Gender" value={formData.Gender} onChange={handleInputChange} className="form-select" required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marital Status</label>
                    <select name="Married" value={formData.Married} onChange={handleInputChange} className="form-select" required>
                      <option value="Yes">Married</option>
                      <option value="No">Single</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Number of Dependents</label>
                    <select name="Dependents" value={formData.Dependents} onChange={handleInputChange} className="form-select" required>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3+">3+</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <select name="Education" value={formData.Education} onChange={handleInputChange} className="form-select" required>
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>
                </div>

                <button type="button" onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Next: Employment & Income →
                </button>
              </div>
            )}

            {/* Step 2: Employment & Income */}
            {step === 2 && (
              <div className="animate-slide-in">
                <h3 className="mb-lg">💼 Employment & Income</h3>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Self Employed</label>
                    <select name="Self_Employed" value={formData.Self_Employed} onChange={handleInputChange} className="form-select" required>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Applicant Income (monthly)</label>
                    <input 
                      type="number" 
                      name="ApplicantIncome" 
                      value={formData.ApplicantIncome} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      placeholder="e.g., 5000"
                      min="0"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Coapplicant Income (monthly)</label>
                    <input 
                      type="number" 
                      name="CoapplicantIncome" 
                      value={formData.CoapplicantIncome} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      placeholder="e.g., 2000 (0 if none)"
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                    Next: Loan Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Loan Details */}
            {step === 3 && (
              <div className="animate-slide-in">
                <h3 className="mb-lg">💰 Loan Details</h3>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Loan Amount (in thousands)</label>
                    <input 
                      type="number" 
                      name="LoanAmount" 
                      value={formData.LoanAmount} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      placeholder="e.g., 150"
                      min="1"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loan Term (months)</label>
                    <select name="Loan_Amount_Term" value={formData.Loan_Amount_Term} onChange={handleInputChange} className="form-select" required>
                      <option value="12">12 months (1 year)</option>
                      <option value="36">36 months (3 years)</option>
                      <option value="60">60 months (5 years)</option>
                      <option value="84">84 months (7 years)</option>
                      <option value="120">120 months (10 years)</option>
                      <option value="180">180 months (15 years)</option>
                      <option value="240">240 months (20 years)</option>
                      <option value="300">300 months (25 years)</option>
                      <option value="360">360 months (30 years)</option>
                      <option value="480">480 months (40 years)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(4)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                    Next: Credit & Property →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Credit & Property */}
            {step === 4 && (
              <div className="animate-slide-in">
                <h3 className="mb-lg">🏠 Credit & Property</h3>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Credit History</label>
                    <select name="Credit_History" value={formData.Credit_History} onChange={handleInputChange} className="form-select" required>
                      <option value="1">Good (1)</option>
                      <option value="0">Bad (0)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Property Area</label>
                    <select name="Property_Area" value={formData.Property_Area} onChange={handleInputChange} className="form-select" required>
                      <option value="Urban">Urban</option>
                      <option value="Semiurban">Semiurban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setStep(3)} className="btn btn-outline" style={{ flex: 1 }}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-success btn-lg" style={{ flex: 1 }}>
                    🚀 Analyze Loan Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
