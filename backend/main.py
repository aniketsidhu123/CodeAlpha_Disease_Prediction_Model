from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import joblib
import pandas as pd
import numpy as np
import tensorflow as tf
import os

app = FastAPI(title="Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
models_dir = os.path.join(os.path.dirname(__file__), 'models')
try:
    heart_model = joblib.load(os.path.join(models_dir, 'heart_disease_rf.pkl'))
    diabetes_model = joblib.load(os.path.join(models_dir, 'diabetes_lr.pkl'))
    diabetes_scaler = joblib.load(os.path.join(models_dir, 'diabetes_scaler.pkl'))
    breast_cancer_model = tf.keras.models.load_model(os.path.join(models_dir, 'breast_cancer_nn.keras'))
    breast_cancer_scaler = joblib.load(os.path.join(models_dir, 'breast_cancer_scaler.pkl'))
except Exception as e:
    print("Warning: Models not found. Ensure train_models.py has been run.")
    print(e)

class PredictionRequest(BaseModel):
    features: List[float]

@app.post("/predict/heart")
def predict_heart(req: PredictionRequest):
    try:
        data = np.array([req.features])
        prediction = heart_model.predict(data)
        probability = heart_model.predict_proba(data)[0][1]
        return {"disease": "Heart Disease", "prediction": int(prediction[0]), "probability": float(probability)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict/diabetes")
def predict_diabetes(req: PredictionRequest):
    try:
        data = np.array([req.features])
        data_scaled = diabetes_scaler.transform(data)
        prediction = diabetes_model.predict(data_scaled)
        probability = diabetes_model.predict_proba(data_scaled)[0][1]
        return {"disease": "Diabetes", "prediction": int(prediction[0]), "probability": float(probability)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict/breast-cancer")
def predict_breast_cancer(req: PredictionRequest):
    try:
        data = np.array([req.features])
        data_scaled = breast_cancer_scaler.transform(data)
        prob = breast_cancer_model.predict(data_scaled)[0][0]
        prediction = 1 if prob > 0.5 else 0
        return {"disease": "Breast Cancer", "prediction": prediction, "probability": float(prob)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Disease Prediction API is running"}
