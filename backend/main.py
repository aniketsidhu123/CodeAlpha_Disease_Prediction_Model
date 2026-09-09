from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import tensorflow as tf
import os
import shap
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    
    logger.info("Models loaded successfully. Initializing SHAP explainers...")
    heart_explainer = shap.TreeExplainer(heart_model)
    diabetes_explainer = shap.LinearExplainer(diabetes_model, np.zeros((1, 21)))
    bc_explainer = shap.GradientExplainer(breast_cancer_model, np.zeros((10, 30)))
    logger.info("SHAP explainers initialized.")
except Exception as e:
    logger.error(f"Warning: Models not found or error loading them. Ensure train_models.py has been run. Error: {e}")

class HeartDiseaseRequest(BaseModel):
    age: float
    sex: float
    chest_pain_type: float
    resting_bp: float
    cholesterol: float
    fasting_bs: float
    resting_ecg: float
    max_hr: float
    exercise_angina: float
    oldpeak: float
    st_slope: float
    major_vessels: float
    thal: float

class DiabetesRequest(BaseModel):
    HighBP: float
    HighChol: float
    CholCheck: float
    BMI: float
    Smoker: float
    Stroke: float
    HeartDiseaseorAttack: float
    PhysActivity: float
    Fruits: float
    Veggies: float
    HvyAlcoholConsump: float
    AnyHealthcare: float
    NoDocbcCost: float
    GenHlth: float
    MentHlth: float
    PhysHlth: float
    DiffWalk: float
    Sex: float
    Age: float
    Education: float
    Income: float

class BreastCancerRequest(BaseModel):
    mean_radius: float
    mean_texture: float
    mean_perimeter: float
    mean_area: float
    mean_smoothness: float
    mean_compactness: float
    mean_concavity: float
    mean_concave_points: float
    mean_symmetry: float
    mean_fractal_dimension: float
    radius_error: float
    texture_error: float
    perimeter_error: float
    area_error: float
    smoothness_error: float
    compactness_error: float
    concavity_error: float
    concave_points_error: float
    symmetry_error: float
    fractal_dimension_error: float
    worst_radius: float
    worst_texture: float
    worst_perimeter: float
    worst_area: float
    worst_smoothness: float
    worst_compactness: float
    worst_concavity: float
    worst_concave_points: float
    worst_symmetry: float
    worst_fractal_dimension: float

heart_features = ['Age', 'Sex', 'Chest Pain Type', 'Resting BP', 'Cholesterol', 'Fasting BS', 'Resting ECG', 'Max HR', 'Exercise Angina', 'Oldpeak', 'Slope', 'Major Vessels', 'Thal']
diabetes_features = ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'Heart Disease or Attack', 'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 'Education', 'Income']
breast_cancer_features = ['mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness', 'mean compactness', 'mean concavity', 'mean concave points', 'mean symmetry', 'mean fractal dimension', 'radius error', 'texture error', 'perimeter error', 'area error', 'smoothness error', 'compactness error', 'concavity error', 'concave points error', 'symmetry error', 'fractal dimension error', 'worst radius', 'worst texture', 'worst perimeter', 'worst area', 'worst smoothness', 'worst compactness', 'worst concavity', 'worst concave points', 'worst symmetry', 'worst fractal dimension']

def get_explanation(sv, feature_names):
    top_indices = np.argsort(np.abs(sv))[-3:][::-1]
    explanations = []
    for i in top_indices:
        impact = "increases" if sv[i] > 0 else "decreases"
        explanations.append(f"{feature_names[i]} ({impact} risk)")
    return "Key factors: " + ", ".join(explanations)

@app.post("/predict/heart")
def predict_heart(req: HeartDiseaseRequest):
    try:
        data = np.array([[getattr(req, f) for f in req.model_fields.keys()]])
        prediction = heart_model.predict(data)
        probability = heart_model.predict_proba(data)[0][1]
        
        sv = heart_explainer.shap_values(data)[0, :, 1]
        explanation = get_explanation(sv, heart_features)
        
        return {"disease": "Heart Disease", "prediction": int(prediction[0]), "probability": float(probability), "explanation": explanation}
    except Exception as e:
        logger.error(f"Error predicting heart disease: {e}")
        raise HTTPException(status_code=422, detail=str(e))

@app.post("/predict/diabetes")
def predict_diabetes(req: DiabetesRequest):
    try:
        data = np.array([[getattr(req, f) for f in req.model_fields.keys()]])
        data_scaled = diabetes_scaler.transform(data)
        prediction = diabetes_model.predict(data_scaled)
        probability = diabetes_model.predict_proba(data_scaled)[0][1]
        
        sv = diabetes_explainer.shap_values(data_scaled)[0]
        explanation = get_explanation(sv, diabetes_features)
        
        return {"disease": "Diabetes", "prediction": int(prediction[0]), "probability": float(probability), "explanation": explanation}
    except Exception as e:
        logger.error(f"Error predicting diabetes: {e}")
        raise HTTPException(status_code=422, detail=str(e))

@app.post("/predict/breast-cancer")
def predict_breast_cancer(req: BreastCancerRequest):
    try:
        data = np.array([[getattr(req, f) for f in req.model_fields.keys()]])
        data_scaled = breast_cancer_scaler.transform(data)
        prob = breast_cancer_model.predict(data_scaled, verbose=0)[0][0]
        prediction = 1 if prob > 0.5 else 0
        
        sv = bc_explainer.shap_values(data_scaled)[0, :, 0]
        explanation = get_explanation(sv, breast_cancer_features)
        
        return {"disease": "Breast Cancer", "prediction": prediction, "probability": float(prob), "explanation": explanation}
    except Exception as e:
        logger.error(f"Error predicting breast cancer: {e}")
        raise HTTPException(status_code=422, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Disease Prediction API is running"}
