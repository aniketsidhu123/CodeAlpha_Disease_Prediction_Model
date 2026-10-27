# 🏥 MedPredict AI — Disease Prediction Model

A full-stack web application that uses machine learning to predict the likelihood of three major diseases with **Explainable AI (XAI)** insights powered by SHAP.

| Disease | Model | Explainer |
|---------|-------|-----------|
| Heart Disease | Random Forest Classifier | SHAP TreeExplainer |
| Diabetes | Logistic Regression | SHAP LinearExplainer |
| Breast Cancer | TensorFlow/Keras Neural Network | SHAP GradientExplainer |

## ✨ Key Features

- **Explicit API Validation** — Named Pydantic fields with medical range constraints (auto-generated Swagger docs at `/docs`)
- **Explainable AI** — SHAP-based explanations show *why* the model made its prediction (e.g., "High risk due to Blood Pressure and Age")
- **Form Validation** — Client-side validation with `react-hook-form` + `zod` prevents impossible medical inputs
- **Data Visualization** — Interactive gauge chart (Recharts) displays risk probability
- **Loading States** — Animated spinner during ML inference
- **Dockerized** — Full-stack deployment with `docker compose up`
- **CI/CD** — GitHub Actions pipeline for linting and build verification

## 📁 Project Structure

```
├── backend/               # FastAPI + ML models
│   ├── main.py            # API endpoints with SHAP explainability
│   ├── train_models.py    # Model training pipeline
│   ├── models/            # Saved ML model artifacts
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── App.jsx        # Main app with forms, gauge chart, explanations
│   │   └── index.css      # Hospital-themed design system
│   ├── package.json
│   └── Dockerfile
├── notebooks/             # Jupyter notebooks for exploration
├── docker-compose.yml     # Full-stack orchestration
├── setup.bat              # Windows 1-click setup & ML model training
├── run.bat                # Windows interactive application launcher
└── .github/workflows/     # CI pipeline
```

## 🚀 Quick Start

### Option 1: Windows 1-Click Scripts (Recommended on Windows)

1. **Setup Environment & Dependencies** (run once):
   ```cmd
   setup.bat
   ```
   *Automatically checks Python & Node.js, sets up the Python virtual environment, installs all backend and frontend dependencies, and trains the machine learning models if missing.*

2. **Launch Application**:
   ```cmd
   run.bat
   ```
   *Opens the interactive launcher. Press `Enter` to start the full stack (FastAPI on port 8000 + React/Vite on port 5173) and automatically open your default browser.*

   **CLI Shortcuts**:
   - `run.bat all` — Start full stack immediately and open browser
   - `run.bat backend` — Start FastAPI backend only
   - `run.bat frontend` — Start Vite frontend only
   - `run.bat docker` — Start via Docker Compose
   - `run.bat stop` — Stop dev servers and release ports 8000 and 5173
   - `setup.bat --retrain` — Force retrain all ML models

### Option 2: Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Option 3: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python train_models.py       # Train models (run once)
uvicorn main:app --reload    # Start API server
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/docs`

## 🛠️ Technologies

| Layer | Stack |
|-------|-------|
| **Frontend** | React 19, Vite, Recharts, react-hook-form, Zod |
| **Backend** | Python 3.12, FastAPI, Pydantic, SHAP |
| **ML** | Scikit-Learn, TensorFlow/Keras, NumPy, Pandas |
| **DevOps** | Docker, Nginx, GitHub Actions |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/predict/heart` | Heart disease prediction with SHAP explanation |
| `POST` | `/predict/diabetes` | Diabetes prediction with SHAP explanation |
| `POST` | `/predict/breast-cancer` | Breast cancer prediction with SHAP explanation |

All prediction endpoints return:
```json
{
  "disease": "Heart Disease",
  "prediction": 1,
  "probability": 0.85,
  "explanation": "Key factors: Cholesterol (increases risk), Age (increases risk), Max HR (decreases risk)"
}
```

## 🧪 CI/CD

The GitHub Actions pipeline (`.github/workflows/main.yml`) runs on every push/PR to `main`:

- **Backend**: Python linting with `flake8` + tests with `pytest`
- **Frontend**: Linting with `oxlint` + production build verification

## 📄 License

MIT License
