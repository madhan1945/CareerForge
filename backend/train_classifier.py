"""
Run this script to train and save the resume classifier.
"""
import sys
sys.path.append('.')

from app.models.classifier import ResumeClassifier

if __name__ == "__main__":
    classifier = ResumeClassifier()

    # Train
    lr_metrics, svm_metrics = classifier.train(
        processed_csv_path="../data/processed/resumes_processed.csv"
    )

    # Save best model
    classifier.save(model_dir="../data/models")

    print("\n🎉 Training complete! Model saved to data/models/")