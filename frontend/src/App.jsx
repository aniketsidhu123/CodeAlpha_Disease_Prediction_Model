import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell } from 'recharts';
import './index.css';

const API_URL = "http://localhost:8000";

// ──────────────────────────────────────────────
// Zod Validation Schemas
// ──────────────────────────────────────────────

const num = (label, min, max) =>
  z.number({ invalid_type_error: `${label} is required` })
    .min(min, `Min ${min}`)
    .max(max, `Max ${max}`);

const heartSchema = z.object({
  age:              num('Age', 1, 120),
  sex:              num('Sex', 0, 1),
  chest_pain_type:  num('Chest Pain', 1, 4),
  resting_bp:       num('BP', 50, 250),
  cholesterol:      num('Cholesterol', 50, 600),
  fasting_bs:       num('Fasting BS', 0, 1),
  resting_ecg:      num('ECG', 0, 2),
  max_hr:           num('HR', 50, 250),
  exercise_angina:  num('Angina', 0, 1),
  oldpeak:          num('Oldpeak', -5, 10),
  st_slope:         num('Slope', 1, 3),
  major_vessels:    num('Vessels', 0, 3),
  thal:             num('Thal', 0, 7),
});

const diabetesSchema = z.object({
  HighBP:               num('HighBP', 0, 1),
  HighChol:             num('HighChol', 0, 1),
  CholCheck:            num('CholCheck', 0, 1),
  BMI:                  num('BMI', 10, 80),
  Smoker:               num('Smoker', 0, 1),
  Stroke:               num('Stroke', 0, 1),
  HeartDiseaseorAttack: num('HeartDisease', 0, 1),
  PhysActivity:         num('PhysActivity', 0, 1),
  Fruits:               num('Fruits', 0, 1),
  Veggies:              num('Veggies', 0, 1),
  HvyAlcoholConsump:    num('Alcohol', 0, 1),
  AnyHealthcare:        num('Healthcare', 0, 1),
  NoDocbcCost:          num('NoDocCost', 0, 1),
  GenHlth:              num('GenHlth', 1, 5),
  MentHlth:             num('MentHlth', 0, 30),
  PhysHlth:             num('PhysHlth', 0, 30),
  DiffWalk:             num('DiffWalk', 0, 1),
  Sex:                  num('Sex', 0, 1),
  Age:                  num('Age', 1, 13),
  Education:            num('Education', 1, 6),
  Income:               num('Income', 1, 8),
});

const bcNum = (label) => z.number({ invalid_type_error: `${label} required` }).min(0, 'Must be ≥ 0');

const breastCancerSchema = z.object({
  mean_radius:             bcNum('Mean radius'),
  mean_texture:            bcNum('Mean texture'),
  mean_perimeter:          bcNum('Mean perimeter'),
  mean_area:               bcNum('Mean area'),
  mean_smoothness:         bcNum('Mean smoothness'),
  mean_compactness:        bcNum('Mean compactness'),
  mean_concavity:          bcNum('Mean concavity'),
  mean_concave_points:     bcNum('Mean concave pts'),
  mean_symmetry:           bcNum('Mean symmetry'),
  mean_fractal_dimension:  bcNum('Mean fractal dim'),
  radius_error:            bcNum('Radius error'),
  texture_error:           bcNum('Texture error'),
  perimeter_error:         bcNum('Perimeter error'),
  area_error:              bcNum('Area error'),
  smoothness_error:        bcNum('Smoothness error'),
  compactness_error:       bcNum('Compactness error'),
  concavity_error:         bcNum('Concavity error'),
  concave_points_error:    bcNum('Concave pts error'),
  symmetry_error:          bcNum('Symmetry error'),
  fractal_dimension_error: bcNum('Fractal dim error'),
  worst_radius:            bcNum('Worst radius'),
  worst_texture:           bcNum('Worst texture'),
  worst_perimeter:         bcNum('Worst perimeter'),
  worst_area:              bcNum('Worst area'),
  worst_smoothness:        bcNum('Worst smoothness'),
  worst_compactness:       bcNum('Worst compactness'),
  worst_concavity:         bcNum('Worst concavity'),
  worst_concave_points:    bcNum('Worst concave pts'),
  worst_symmetry:          bcNum('Worst symmetry'),
  worst_fractal_dimension: bcNum('Worst fractal dim'),
});

// ──────────────────────────────────────────────
// Field Configurations
// ──────────────────────────────────────────────

const heartFields = [
  { name: 'age',             label: 'Age (years)',                     placeholder: 'e.g. 55' },
  { name: 'sex',             label: 'Sex (1=M, 0=F)',                 placeholder: '0 or 1' },
  { name: 'chest_pain_type', label: 'Chest Pain Type (1–4)',          placeholder: '1–4' },
  { name: 'resting_bp',      label: 'Resting BP (mmHg)',              placeholder: 'e.g. 130' },
  { name: 'cholesterol',     label: 'Cholesterol (mg/dl)',            placeholder: 'e.g. 245' },
  { name: 'fasting_bs',      label: 'Fasting BS > 120 (1/0)',         placeholder: '0 or 1' },
  { name: 'resting_ecg',     label: 'Resting ECG (0–2)',              placeholder: '0–2' },
  { name: 'max_hr',          label: 'Max Heart Rate',                 placeholder: 'e.g. 150' },
  { name: 'exercise_angina', label: 'Exercise Angina (1/0)',          placeholder: '0 or 1' },
  { name: 'oldpeak',         label: 'Oldpeak (ST depression)',        placeholder: 'e.g. 1.5' },
  { name: 'st_slope',        label: 'ST Slope (1–3)',                 placeholder: '1–3' },
  { name: 'major_vessels',   label: 'Major Vessels (0–3)',            placeholder: '0–3' },
  { name: 'thal',            label: 'Thal (3=normal, 6=fixed, 7=rev)',placeholder: '3, 6, or 7' },
];

const diabetesFields = [
  { name: 'HighBP',               label: 'High BP (1/0)',               placeholder: '0 or 1' },
  { name: 'HighChol',             label: 'High Cholesterol (1/0)',      placeholder: '0 or 1' },
  { name: 'CholCheck',            label: 'Cholesterol Check (1/0)',     placeholder: '0 or 1' },
  { name: 'BMI',                  label: 'BMI',                         placeholder: 'e.g. 28.5' },
  { name: 'Smoker',               label: 'Smoker (1/0)',                placeholder: '0 or 1' },
  { name: 'Stroke',               label: 'Stroke History (1/0)',        placeholder: '0 or 1' },
  { name: 'HeartDiseaseorAttack', label: 'Heart Disease/Attack (1/0)',  placeholder: '0 or 1' },
  { name: 'PhysActivity',         label: 'Physical Activity (1/0)',     placeholder: '0 or 1' },
  { name: 'Fruits',               label: 'Fruit Consumption (1/0)',     placeholder: '0 or 1' },
  { name: 'Veggies',              label: 'Vegetable Consumption (1/0)', placeholder: '0 or 1' },
  { name: 'HvyAlcoholConsump',    label: 'Heavy Alcohol (1/0)',         placeholder: '0 or 1' },
  { name: 'AnyHealthcare',        label: 'Any Healthcare (1/0)',        placeholder: '0 or 1' },
  { name: 'NoDocbcCost',          label: 'No Doctor (Cost) (1/0)',      placeholder: '0 or 1' },
  { name: 'GenHlth',              label: 'General Health (1–5)',        placeholder: '1–5' },
  { name: 'MentHlth',             label: 'Mental Health Days (0–30)',   placeholder: '0–30' },
  { name: 'PhysHlth',             label: 'Physical Health Days (0–30)', placeholder: '0–30' },
  { name: 'DiffWalk',             label: 'Difficulty Walking (1/0)',    placeholder: '0 or 1' },
  { name: 'Sex',                  label: 'Sex (1=M, 0=F)',             placeholder: '0 or 1' },
  { name: 'Age',                  label: 'Age Category (1–13)',         placeholder: '1–13' },
  { name: 'Education',            label: 'Education Level (1–6)',       placeholder: '1–6' },
  { name: 'Income',               label: 'Income Level (1–8)',          placeholder: '1–8' },
];

const breastCancerFields = [
  { name: 'mean_radius',             label: 'Mean Radius',             placeholder: 'e.g. 14.1' },
  { name: 'mean_texture',            label: 'Mean Texture',            placeholder: 'e.g. 19.3' },
  { name: 'mean_perimeter',          label: 'Mean Perimeter',          placeholder: 'e.g. 91.4' },
  { name: 'mean_area',               label: 'Mean Area',               placeholder: 'e.g. 655' },
  { name: 'mean_smoothness',         label: 'Mean Smoothness',         placeholder: 'e.g. 0.1' },
  { name: 'mean_compactness',        label: 'Mean Compactness',        placeholder: 'e.g. 0.13' },
  { name: 'mean_concavity',          label: 'Mean Concavity',          placeholder: 'e.g. 0.08' },
  { name: 'mean_concave_points',     label: 'Mean Concave Points',     placeholder: 'e.g. 0.05' },
  { name: 'mean_symmetry',           label: 'Mean Symmetry',           placeholder: 'e.g. 0.18' },
  { name: 'mean_fractal_dimension',  label: 'Mean Fractal Dimension',  placeholder: 'e.g. 0.06' },
  { name: 'radius_error',            label: 'Radius Error',            placeholder: 'e.g. 0.4' },
  { name: 'texture_error',           label: 'Texture Error',           placeholder: 'e.g. 1.2' },
  { name: 'perimeter_error',         label: 'Perimeter Error',         placeholder: 'e.g. 2.8' },
  { name: 'area_error',              label: 'Area Error',              placeholder: 'e.g. 40' },
  { name: 'smoothness_error',        label: 'Smoothness Error',        placeholder: 'e.g. 0.007' },
  { name: 'compactness_error',       label: 'Compactness Error',       placeholder: 'e.g. 0.025' },
  { name: 'concavity_error',         label: 'Concavity Error',         placeholder: 'e.g. 0.03' },
  { name: 'concave_points_error',    label: 'Concave Points Error',    placeholder: 'e.g. 0.01' },
  { name: 'symmetry_error',          label: 'Symmetry Error',          placeholder: 'e.g. 0.02' },
  { name: 'fractal_dimension_error', label: 'Fractal Dim Error',       placeholder: 'e.g. 0.003' },
  { name: 'worst_radius',            label: 'Worst Radius',            placeholder: 'e.g. 16.3' },
  { name: 'worst_texture',           label: 'Worst Texture',           placeholder: 'e.g. 25.5' },
  { name: 'worst_perimeter',         label: 'Worst Perimeter',         placeholder: 'e.g. 107' },
  { name: 'worst_area',              label: 'Worst Area',              placeholder: 'e.g. 880' },
  { name: 'worst_smoothness',        label: 'Worst Smoothness',        placeholder: 'e.g. 0.16' },
  { name: 'worst_compactness',       label: 'Worst Compactness',       placeholder: 'e.g. 0.32' },
  { name: 'worst_concavity',         label: 'Worst Concavity',         placeholder: 'e.g. 0.28' },
  { name: 'worst_concave_points',    label: 'Worst Concave Points',    placeholder: 'e.g. 0.15' },
  { name: 'worst_symmetry',          label: 'Worst Symmetry',          placeholder: 'e.g. 0.3' },
  { name: 'worst_fractal_dimension', label: 'Worst Fractal Dimension', placeholder: 'e.g. 0.08' },
];

// ──────────────────────────────────────────────
// Model Configurations
// ──────────────────────────────────────────────

const modelConfigs = [
  {
    id: 'heart',
    name: 'Heart Disease',
    icon: '🫀',
    endpoint: '/predict/heart',
    schema: heartSchema,
    fields: heartFields,
    description: 'Predicts cardiovascular disease risk using 13 clinical features.',
  },
  {
    id: 'diabetes',
    name: 'Diabetes',
    icon: '🩸',
    endpoint: '/predict/diabetes',
    schema: diabetesSchema,
    fields: diabetesFields,
    description: 'Assesses diabetes risk from lifestyle and health indicators.',
  },
  {
    id: 'breast_cancer',
    name: 'Breast Cancer',
    icon: '🎗️',
    endpoint: '/predict/breast-cancer',
    schema: breastCancerSchema,
    fields: breastCancerFields,
    description: 'Classifies breast masses using cell nuclei measurements.',
  },
];

// ──────────────────────────────────────────────
// Gauge Chart Component (Recharts)
// ──────────────────────────────────────────────

function GaugeChart({ probability }) {
  const percent = Math.round(probability * 100);
  const isHighRisk = probability > 0.5;
  const color = isHighRisk ? '#dc2626' : '#059669';
  const bgColor = 'rgba(0,0,0,0.04)';

  const gaugeData = [
    { name: 'value', value: percent },
    { name: 'empty', value: 100 - percent },
  ];

  return (
    <div className="gauge-wrapper">
      <PieChart width={260} height={150}>
        <Pie
          data={gaugeData}
          cx={130}
          cy={130}
          startAngle={180}
          endAngle={0}
          innerRadius={75}
          outerRadius={105}
          dataKey="value"
          stroke="none"
          animationBegin={0}
          animationDuration={1000}
        >
          <Cell fill={color} />
          <Cell fill={bgColor} />
        </Pie>
      </PieChart>
      <div className="gauge-label">
        <span className="gauge-value" style={{ color }}>{percent}%</span>
        <span className="gauge-text">Risk Score</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Explanation Panel Component
// ──────────────────────────────────────────────

function ExplanationPanel({ explanation }) {
  if (!explanation) return null;

  // Parse explanation: "Key factors: Age (increases risk), BMI (decreases risk), ..."
  const parts = explanation.replace('Key factors: ', '').split(', ');
  const factors = parts.map(part => {
    const match = part.match(/^(.+?)\s*\((increases|decreases)\s+risk\)$/);
    if (match) return { name: match[1], direction: match[2] };
    return { name: part, direction: 'increases' };
  });

  return (
    <div className="explanation-panel">
      <div className="explanation-title">
        🔍 AI Explanation (SHAP Analysis)
      </div>
      <p className="explanation-text">
        The model identified the following features as the most influential for this prediction:
      </p>
      <div className="explanation-factors">
        {factors.map((factor, i) => (
          <span key={i} className={`factor-chip ${factor.direction}`}>
            {factor.direction === 'increases' ? '↑' : '↓'} {factor.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Prediction Form Component
// ──────────────────────────────────────────────

function PredictionForm({ model }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(model.schema),
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}${model.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || `Prediction failed (HTTP ${res.status})`);
      }

      const resultData = await res.json();
      setResult(resultData);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="form-grid" noValidate>
        {model.fields.map((field) => (
          <div
            className={`input-group ${errors[field.name] ? 'has-error' : ''}`}
            key={field.name}
          >
            <label htmlFor={`${model.id}-${field.name}`}>{field.label}</label>
            <input
              id={`${model.id}-${field.name}`}
              type="number"
              step="any"
              placeholder={field.placeholder || '0'}
              {...register(field.name, { valueAsNumber: true })}
            />
            {errors[field.name] && (
              <span className="error-message">
                {errors[field.name].message}
              </span>
            )}
          </div>
        ))}

        <div className="form-actions">
          {errorCount > 0 && (
            <p className="error-message" style={{ marginBottom: '0.75rem', justifyContent: 'center' }}>
              Please fix {errorCount} validation {errorCount === 1 ? 'error' : 'errors'} above
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Analyzing Patient Data...
              </span>
            ) : (
              'Run Prediction Model'
            )}
          </button>
        </div>
      </form>

      {apiError && <div className="error-banner">⚠️ {apiError}</div>}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner spinner-lg"></div>
          <span className="loading-text loading-pulse">
            Running inference through the ML model...
          </span>
        </div>
      )}

      {result && (
        <div className={`result-section ${result.prediction === 1 ? 'result-high' : 'result-low'}`}>
          <div className="result-header">
            <h3>
              {result.prediction === 1 ? '⚠️ High Risk Detected' : '✅ Low Risk'}
            </h3>
            <span className="result-subtitle">
              {result.disease} — Confidence: {(result.probability * 100).toFixed(1)}%
            </span>
          </div>

          <GaugeChart probability={result.probability} />

          <ExplanationPanel explanation={result.explanation} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main App Component
// ──────────────────────────────────────────────

function App() {
  const [activeModelId, setActiveModelId] = useState('heart');
  const activeModel = modelConfigs.find(m => m.id === activeModelId);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <span>🏥</span> MedPredict AI
        </div>

        <div className="sidebar-section-label">Prediction Models</div>

        {modelConfigs.map(model => (
          <div
            key={model.id}
            className={`nav-item ${activeModelId === model.id ? 'active' : ''}`}
            onClick={() => setActiveModelId(model.id)}
          >
            <span className="nav-icon">{model.icon}</span>
            {model.name}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="prediction-card glass-panel" key={activeModelId}>
          <div className="card-header">
            <span className="card-icon">{activeModel.icon}</span>
            <h2>{activeModel.name} Prediction</h2>
            <p>{activeModel.description}</p>
          </div>

          <PredictionForm model={activeModel} />
        </div>
      </div>
    </div>
  );
}

export default App;
