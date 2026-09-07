import { useState } from 'react';
import './index.css';

const API_URL = "http://localhost:8000";

function App() {
  const [activeModel, setActiveModel] = useState('heart');

  const models = [
    { id: 'heart', name: 'Heart Disease', icon: '🫀' },
    { id: 'diabetes', name: 'Diabetes', icon: '🩸' },
    { id: 'breast_cancer', name: 'Breast Cancer', icon: '🎗️' },
  ];

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          🏥 MedPredict AI
        </div>
        
        {models.map(model => (
          <div 
            key={model.id}
            className={`nav-item ${activeModel === model.id ? 'active' : ''}`}
            onClick={() => setActiveModel(model.id)}
          >
            <span>{model.icon}</span>
            {model.name}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="prediction-card glass-panel">
          <div className="card-header">
            <h2>{models.find(m => m.id === activeModel)?.name} Prediction</h2>
            <p>Enter patient data to get an AI-driven prediction score.</p>
          </div>

          {activeModel === 'heart' && <PredictionForm modelId="heart" endpoint="/predict/heart" fields={13} labels={['Age', 'Sex (1=M, 0=F)', 'Chest Pain Type (1-4)', 'Resting Blood Pressure', 'Cholesterol (mg/dl)', 'Fasting Blood Sugar > 120 (1/0)', 'Resting ECG (0-2)', 'Max Heart Rate', 'Exercise Induced Angina (1/0)', 'Oldpeak', 'Slope (1-3)', 'Number of Major Vessels (0-3)', 'Thal (3=normal, 6=fixed, 7=reversable)']} />}
          
          {activeModel === 'diabetes' && <PredictionForm modelId="diabetes" endpoint="/predict/diabetes" fields={21} labels={[
            'HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'HeartDiseaseorAttack', 'PhysActivity',
            'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth',
            'DiffWalk', 'Sex', 'Age', 'Education', 'Income'
          ]} />}
          
          {activeModel === 'breast_cancer' && <PredictionForm modelId="breast_cancer" endpoint="/predict/breast-cancer" fields={30} labels={[
            'mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness', 'mean compactness', 'mean concavity',
            'mean concave points', 'mean symmetry', 'mean fractal dimension', 'radius error', 'texture error', 'perimeter error',
            'area error', 'smoothness error', 'compactness error', 'concavity error', 'concave points error', 'symmetry error',
            'fractal dimension error', 'worst radius', 'worst texture', 'worst perimeter', 'worst area', 'worst smoothness',
            'worst compactness', 'worst concavity', 'worst concave points', 'worst symmetry', 'worst fractal dimension'
          ]} />}
        </div>
      </div>
    </div>
  );
}

function PredictionForm({ modelId, endpoint, fields, labels }) {
  const [formData, setFormData] = useState(Array(fields).fill(''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (index, value) => {
    const newData = [...formData];
    newData[index] = value;
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const features = formData.map(val => parseFloat(val) || 0);
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      });

      if (!res.ok) throw new Error("Prediction failed. Check input data.");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-grid">
        {Array.from({ length: fields }).map((_, i) => (
          <div className="input-group" key={`${modelId}-field-${i}`}>
            <label>{labels && labels[i] ? labels[i] : `Feature ${i+1}`}</label>
            <input 
              type="number" 
              step="any"
              required 
              value={formData[i]} 
              onChange={(e) => handleChange(i, e.target.value)} 
              placeholder="0.0"
            />
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Prediction Model'}
          </button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}

      {result && (
        <div className={`result-section ${result.prediction === 1 ? 'result-high' : 'result-low'}`}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {result.prediction === 1 ? '⚠️ High Risk Detected' : '✅ Low Risk'}
          </h3>
          <p>Confidence Score: {(result.probability * 100).toFixed(1)}%</p>
          <div className="probability-bar-container">
            <div 
              className="probability-bar" 
              style={{ 
                width: `${result.probability * 100}%`,
                background: result.prediction === 1 ? 'var(--danger)' : 'var(--success)'
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
