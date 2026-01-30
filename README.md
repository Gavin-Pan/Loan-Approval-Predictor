# 🏦 Loan Approval Predictor

A full-stack ML-powered loan approval prediction application with beautiful UI, feature impact analysis, and personalized recommendations.

![Loan Approval Predictor](https://img.shields.io/badge/ML-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

## ✨ Features

- **🤖 ML-Powered Predictions**: Random Forest classifier with 80%+ accuracy
- **📊 Feature Impact Analysis**: See which factors affect your approval chances
- **💡 Personalized Recommendations**: Get actionable advice to improve approval odds
- **🔮 What-If Scenarios**: Explore how changes affect your probability
- **🎨 Beautiful Dark UI**: Modern glassmorphism design with smooth animations
- **📱 Fully Responsive**: Works perfectly on mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Train the ML model:
```bash
python train_model.py
```

4. Start the API server:
```bash
python main.py
```

The API will be running at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be running at `http://localhost:3000`

## 📁 Project Structure

```
Loan_Approval/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── train_model.py          # ML model training script
│   ├── requirements.txt        # Python dependencies
│   ├── loan_model.pkl          # Trained model (generated)
│   ├── label_encoders.pkl      # Feature encoders (generated)
│   └── feature_importance.json # Feature rankings (generated)
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Design system
│   │   └── lib/
│   │       └── api.ts         # API client
│   ├── package.json
│   └── tsconfig.json
└── loanTrain.csv              # Training dataset
```

## 🎯 How It Works

### Machine Learning Pipeline

1. **Data Preprocessing**:
   - Handle missing values
   - Encode categorical variables
   - Feature engineering (income ratios, EMI calculations, etc.)

2. **Model Training**:
   - Algorithm: Random Forest Classifier
   - Features: 17 engineered features from 11 input fields
   - Cross-validation for robust performance

3. **Prediction**:
   - Real-time probability calculation
   - Feature importance analysis
   - Confidence scoring

### Application Flow

1. **Multi-Step Form**: Users fill out 4 steps of information
2. **API Request**: Form data sent to FastAPI backend
3. **ML Prediction**: Model analyzes and predicts approval probability
4. **Results Dashboard**: Beautiful visualization of results with:
   - Approval/rejection probability
   - Feature impact breakdown
   - Personalized recommendations
   - What-if scenario analysis

## 🌐 Deployment

### Backend Deployment (Railway/Render)

#### Option 1: Railway

1. Create a `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Push to GitHub and connect to Railway
3. Set environment variables if needed
4. Deploy!

#### Option 2: Render

1. Create a `render.yaml`:
```yaml
services:
  - type: web
    name: loan-approval-api
    env: python
    buildCommand: pip install -r requirements.txt && python train_model.py
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Connect GitHub repo to Render
3. Deploy!

### Frontend Deployment (Vercel)

1. Push frontend to GitHub

2. Connect to Vercel:
```bash
npm install -g vercel
vercel
```

3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

4. Deploy:
```bash
vercel --prod
```

### Alternative: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN python train_model.py

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up
```

## 📊 Dataset

The model is trained on a loan approval dataset with the following features:

- **Demographics**: Gender, Married, Dependents, Education
- **Employment**: Self_Employed status
- **Income**: ApplicantIncome, CoapplicantIncome
- **Loan Details**: LoanAmount, Loan_Amount_Term
- **Credit**: Credit_History (1=good, 0=bad)
- **Property**: Property_Area (Urban/Semiurban/Rural)
- **Target**: Loan_Status (Y=Approved, N=Rejected)

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **scikit-learn**: Machine learning library
- **pandas**: Data manipulation
- **joblib**: Model persistence
- **uvicorn**: ASGI server

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Vanilla CSS**: Custom design system
- **No external UI libraries**: Pure CSS for maximum control

## 🎨 Design System

- **Color Palette**: Professional dark theme with blue primary, green success, red danger
- **Typography**: Inter font family
- **Components**: Glassmorphism cards, smooth animations, responsive grid
- **Animations**: Fade-in, slide-in, pulse effects
- **Responsive**: Mobile-first design

## 📈 Model Performance

- **Training Accuracy**: ~85%
- **Test Accuracy**: ~80%
- **Key Features**: Credit_History, TotalIncome, LoanAmountToIncome

## 🔒 Security Notes

For production deployment:

1. **CORS**: Update CORS origins in `backend/main.py` to your frontend URL
2. **Environment Variables**: Use `.env` files for sensitive data
3. **API Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Already implemented with Pydantic models
5. **HTTPS**: Use HTTPS in production (automatic on Vercel/Railway)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Dataset: Loan prediction dataset
- Design inspiration: Modern fintech applications
- ML framework: scikit-learn community

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, FastAPI, and Machine Learning**
