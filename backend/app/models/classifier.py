"""
Resume Classifier - Baseline Model
TF-IDF + Logistic Regression
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, classification_report
)


class ResumeClassifier:
    """
    Baseline resume classifier using TF-IDF + ML models.
    Trains both Logistic Regression and LinearSVC,
    compares performance and saves the best model.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True
        )
        self.label_encoder = LabelEncoder()
        self.lr_model = LogisticRegression(
            max_iter=1000,
            C=1.0,
            random_state=42
        )
        self.svm_model = LinearSVC(
            max_iter=1000,
            C=1.0,
            random_state=42
        )
        self.best_model = None
        self.best_model_name = None

    def load_data(self, processed_csv_path: str):
        """Load and prepare the processed dataset."""
        df = pd.read_csv(processed_csv_path)
        print(f"✅ Loaded {len(df)} resumes")
        print(f"✅ Categories: {df['category'].nunique()}")
        return df

    def prepare_features(self, df):
        """Transform text to TF-IDF features."""
        X = self.vectorizer.fit_transform(df['normalized_text'].fillna(''))
        y = self.label_encoder.fit_transform(df['category'])
        print(f"✅ Feature matrix shape: {X.shape}")
        print(f"✅ Classes: {list(self.label_encoder.classes_)}")
        return X, y

    def evaluate_model(self, model, X_test, y_test, model_name: str):
        """Evaluate model and print metrics."""
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        print(f"\n{'='*50}")
        print(f"📊 {model_name} Results")
        print(f"{'='*50}")
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"\n{classification_report(y_test, y_pred, target_names=self.label_encoder.classes_, zero_division=0)}")

        return {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1}

    def train(self, processed_csv_path: str):
        """Full training pipeline."""
        # Load data
        df = self.load_data(processed_csv_path)

        # Prepare features
        X, y = self.prepare_features(df)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        print(f"\n✅ Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")

        # Train Logistic Regression
        print("\n🔄 Training Logistic Regression...")
        self.lr_model.fit(X_train, y_train)
        lr_metrics = self.evaluate_model(self.lr_model, X_test, y_test, "Logistic Regression")

        # Train LinearSVC
        print("\n🔄 Training LinearSVC...")
        self.svm_model.fit(X_train, y_train)
        svm_metrics = self.evaluate_model(self.svm_model, X_test, y_test, "LinearSVC")

        # Pick best model
        if lr_metrics['f1'] >= svm_metrics['f1']:
            self.best_model = self.lr_model
            self.best_model_name = "Logistic Regression"
        else:
            self.best_model = self.svm_model
            self.best_model_name = "LinearSVC"

        print(f"\n🏆 Best Model: {self.best_model_name}")
        return lr_metrics, svm_metrics

    def save(self, model_dir: str):
        """Save best model, vectorizer, and label encoder."""
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.best_model, os.path.join(model_dir, "classifier.pkl"))
        joblib.dump(self.vectorizer, os.path.join(model_dir, "vectorizer.pkl"))
        joblib.dump(self.label_encoder, os.path.join(model_dir, "label_encoder.pkl"))
        print(f"\n✅ Model saved to {model_dir}")

    def load(self, model_dir: str):
        """Load saved model, vectorizer, and label encoder."""
        self.best_model = joblib.load(os.path.join(model_dir, "classifier.pkl"))
        self.vectorizer = joblib.load(os.path.join(model_dir, "vectorizer.pkl"))
        self.label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.pkl"))
        print(f"✅ Model loaded from {model_dir}")

    def predict(self, text: str) -> dict:
        """Predict category for a single resume text."""
        from app.nlp.preprocessor import ResumePreprocessor
        preprocessor = ResumePreprocessor()
        processed = preprocessor.full_pipeline(text)
        normalized = processed['normalized_text']
        X = self.vectorizer.transform([normalized])
        pred = self.best_model.predict(X)[0]
        category = self.label_encoder.inverse_transform([pred])[0]

        # Get probabilities if available
        confidence = None
        if hasattr(self.best_model, 'predict_proba'):
            proba = self.best_model.predict_proba(X)[0]
            confidence = round(float(proba.max()), 4)

        return {
            "category": category,
            "confidence": confidence,
            "skills": processed['skills'],
            "education": processed['education'],
            "experience_years": processed['experience_years']
        }