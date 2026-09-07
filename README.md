# Disease Prediction Model

This is a full-stack web application that uses machine learning to predict the likelihood of three major diseases:
1. **Heart Disease** (using Random Forest Classifier)
2. **Diabetes** (using Logistic Regression)
3. **Breast Cancer** (using a Neural Network built with TensorFlow/Keras)

## Project Structure
- `backend/`: FastAPI application that serves the ML models via REST API endpoints.
- `frontend/`: React + Vite application that provides the user interface.
- `notebooks/`: Jupyter Notebooks for data exploration and model prototyping.

## Prerequisites
- Node.js (v14 or higher)
- Python (3.8 or higher)

## Setup Instructions

### 1. Backend Setup (FastAPI + ML Models)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Train and generate the machine learning models (required before running the server):
   ```bash
   python train_models.py
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will run at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`. Open this URL in your browser to interact with the application.

## Technologies Used
- **Frontend**: React, Vite, CSS
- **Backend**: Python, FastAPI, Uvicorn
- **Machine Learning**: Scikit-Learn, TensorFlow/Keras, Pandas, Numpy, Joblib

## License
MIT License
