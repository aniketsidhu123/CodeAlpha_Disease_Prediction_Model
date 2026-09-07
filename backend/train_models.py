import os
import joblib
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_breast_cancer
from ucimlrepo import fetch_ucirepo

os.makedirs('models', exist_ok=True)

# 1. Heart Disease
print("Training Heart Disease Model...")
heart_disease = fetch_ucirepo(id=45)
X = heart_disease.data.features.copy()
y = heart_disease.data.targets.copy()
y = y.map(lambda x: 1 if x > 0 else 0)
X.fillna(X.median(), inplace=True)
X_train, X_test, y_train, y_test = train_test_split(X, y.values.ravel(), test_size=0.2, random_state=42)
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
joblib.dump(rf, 'models/heart_disease_rf.pkl')
print("Heart Disease model saved.")

# 2. Diabetes
print("Training Diabetes Model...")
diabetes_data = fetch_ucirepo(id=891)
X = diabetes_data.data.features.copy()
y = diabetes_data.data.targets.copy()
if len(X) > 10000:
    X = X.sample(10000, random_state=42)
    y = y.loc[X.index]
y = y.values.ravel()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler_diab = StandardScaler()
X_train_scaled = scaler_diab.fit_transform(X_train)
lr = LogisticRegression(max_iter=1000)
lr.fit(X_train_scaled, y_train)
joblib.dump(lr, 'models/diabetes_lr.pkl')
joblib.dump(scaler_diab, 'models/diabetes_scaler.pkl')
print("Diabetes model saved.")

# 3. Breast Cancer
print("Training Breast Cancer Model...")
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler_bc = StandardScaler()
X_train_scaled = scaler_bc.fit_transform(X_train)
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(X_train_scaled, y_train, epochs=50, batch_size=16, verbose=0)
model.save('models/breast_cancer_nn.keras')
joblib.dump(scaler_bc, 'models/breast_cancer_scaler.pkl')
print("Breast Cancer model saved.")
print("All models trained and saved successfully.")
