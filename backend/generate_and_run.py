import nbformat as nbf
import os
import subprocess

def create_heart_disease_notebook():
    nb = nbf.v4.new_notebook()
    
    nb.cells = [
        nbf.v4.new_markdown_cell("# Heart Disease Prediction Model (Random Forest)"),
        nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from ucimlrepo import fetch_ucirepo"""),
        nbf.v4.new_markdown_cell("## 1. Data Loading"),
        nbf.v4.new_code_cell("""# fetch dataset (Heart Disease id=45)
heart_disease = fetch_ucirepo(id=45)

X = heart_disease.data.features
y = heart_disease.data.targets

# Some targets are 1,2,3,4 (presence of disease) and 0 (absence)
# We will convert it to a binary classification problem: 0 for absence, 1 for presence
y = y.applymap(lambda x: 1 if x > 0 else 0)

print(X.head())"""),
        nbf.v4.new_markdown_cell("## 2. Preprocessing"),
        nbf.v4.new_code_cell("""# Handle missing values
X.fillna(X.median(), inplace=True)

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y.values.ravel(), test_size=0.2, random_state=42)
print(f"Training size: {X_train.shape}, Testing size: {X_test.shape}")"""),
        nbf.v4.new_markdown_cell("## 3. Model Training & Evaluation"),
        nbf.v4.new_code_cell("""# Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"Accuracy: {acc*100:.2f}%")"""),
        nbf.v4.new_markdown_cell("## 4. Save Model"),
        nbf.v4.new_code_cell("""import os
os.makedirs('../models', exist_ok=True)
joblib.dump(model, '../models/heart_disease_rf.pkl')
print("Model saved to ../models/heart_disease_rf.pkl")""")
    ]
    
    with open('notebooks/heart_disease.ipynb', 'w') as f:
        nbf.write(nb, f)

def create_diabetes_notebook():
    nb = nbf.v4.new_notebook()
    
    nb.cells = [
        nbf.v4.new_markdown_cell("# Diabetes Prediction Model (Logistic Regression)"),
        nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from ucimlrepo import fetch_ucirepo"""),
        nbf.v4.new_markdown_cell("## 1. Data Loading"),
        nbf.v4.new_code_cell("""# fetch dataset (Diabetes 130-US hospitals for years 1999-2008 id=296 or Pima Indians id=???)
# Actually UCI has 'predicting diabetes' or we can use scikit-learn's built-in diabetes which is for regression.
# Let's use the CDC Diabetes Health Indicators dataset (id=891) or just download via ucimlrepo.
# ID 891 is CDC Diabetes Health Indicators.
diabetes_data = fetch_ucirepo(id=891)

X = diabetes_data.data.features
y = diabetes_data.data.targets

print(X.shape)
# Take a sample if dataset is too large to speed up training
if len(X) > 10000:
    X = X.sample(10000, random_state=42)
    y = y.loc[X.index]

y = y.values.ravel()
"""),
        nbf.v4.new_markdown_cell("## 2. Preprocessing"),
        nbf.v4.new_code_cell("""# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
"""),
        nbf.v4.new_markdown_cell("## 3. Model Training & Evaluation"),
        nbf.v4.new_code_cell("""# Logistic Regression
model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

preds = model.predict(X_test_scaled)
acc = accuracy_score(y_test, preds)
print(f"Accuracy: {acc*100:.2f}%")"""),
        nbf.v4.new_markdown_cell("## 4. Save Model & Scaler"),
        nbf.v4.new_code_cell("""joblib.dump(model, '../models/diabetes_lr.pkl')
joblib.dump(scaler, '../models/diabetes_scaler.pkl')
print("Model and Scaler saved.")""")
    ]
    
    with open('notebooks/diabetes.ipynb', 'w') as f:
        nbf.write(nb, f)

def create_breast_cancer_notebook():
    nb = nbf.v4.new_notebook()
    
    nb.cells = [
        nbf.v4.new_markdown_cell("# Breast Cancer Prediction (TensorFlow Neural Network)"),
        nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib"""),
        nbf.v4.new_markdown_cell("## 1. Data Loading"),
        nbf.v4.new_code_cell("""# Using scikit-learn's built in breast cancer dataset (which comes from UCI)
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target
print(X.head())"""),
        nbf.v4.new_markdown_cell("## 2. Preprocessing"),
        nbf.v4.new_code_cell("""X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
"""),
        nbf.v4.new_markdown_cell("## 3. Model Building & Training"),
        nbf.v4.new_code_cell("""model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

history = model.fit(X_train_scaled, y_train, epochs=50, batch_size=16, validation_split=0.2, verbose=0)

loss, accuracy = model.evaluate(X_test_scaled, y_test)
print(f"Test Accuracy: {accuracy*100:.2f}%")"""),
        nbf.v4.new_markdown_cell("## 4. Save Model & Scaler"),
        nbf.v4.new_code_cell("""model.save('../models/breast_cancer_nn.keras')
joblib.dump(scaler, '../models/breast_cancer_scaler.pkl')
print("Model and Scaler saved.")""")
    ]
    
    with open('notebooks/breast_cancer.ipynb', 'w') as f:
        nbf.write(nb, f)

if __name__ == "__main__":
    print("Creating notebooks...")
    os.makedirs('notebooks', exist_ok=True)
    create_heart_disease_notebook()
    create_diabetes_notebook()
    create_breast_cancer_notebook()
    
    print("Running notebooks to train models (this may take a minute)...")
    for nb in ['heart_disease.ipynb', 'diabetes.ipynb', 'breast_cancer.ipynb']:
        print(f"Executing {nb}...")
        subprocess.run(['jupyter', 'nbconvert', '--to', 'notebook', '--execute', '--inplace', f'notebooks/{nb}'])
    
    print("All models trained and saved successfully.")
