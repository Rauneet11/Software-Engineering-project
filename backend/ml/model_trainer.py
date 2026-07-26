"""
Model Trainer Module
Trains XGBoost, Linear Regression, or Random Forest on cleaned sales data.
"""
import pandas as pd
import numpy as np
import joblib
import os
import copy
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from preprocessor import DataPreprocessor
import warnings
warnings.filterwarnings('ignore')

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_models')
os.makedirs(MODELS_DIR, exist_ok=True)


class ModelTrainer:
    """Train and evaluate ML models for sales forecasting."""

    SUPPORTED_MODELS = {
        'xgboost': lambda: XGBRegressor(
            n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42, verbosity=0
        ),
        'linear': lambda: LinearRegression(),
        'random_forest': lambda: RandomForestRegressor(
            n_estimators=100, random_state=42, n_jobs=-1
        ),
    }

    def __init__(self, model_type='xgboost'):
        self.model_type    = model_type
        self.model         = None
        self.preprocessor  = DataPreprocessor()
        self.feature_names = []
        self.model_path    = None

    def train(self, file_path: str) -> tuple:
        """
        Train model on given CSV file.
        Returns: (metrics_dict, model_path)
        """
        df = pd.read_csv(file_path)

        # Clean data
        cleaned_df, _ = self.preprocessor.clean(df)

        # Prepare features
        X, y, feature_names = self.preprocessor.prepare_features(cleaned_df)
        self.feature_names   = feature_names

        if len(X) < 10:
            raise ValueError('Not enough data. Need at least 10 rows after cleaning.')

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Build and train model
        model_factory = self.SUPPORTED_MODELS.get(self.model_type, self.SUPPORTED_MODELS['xgboost'])
        self.model = model_factory()
        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        y_pred = np.maximum(y_pred, 0)  # No negative revenue

        mae  = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2   = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-9))) * 100

        metrics = {
            'mae':  round(float(mae), 2),
            'rmse': round(float(rmse), 2),
            'r2':   round(float(r2), 4),
            'mape': round(float(mape), 2),
        }

        # Save model + metadata
        self.model_path  = os.path.join(MODELS_DIR, f'{self.model_type}_model.joblib')
        metadata_path    = os.path.join(MODELS_DIR, f'{self.model_type}_metadata.joblib')

        joblib.dump(self.model, self.model_path)
        joblib.dump({
            'feature_names': self.feature_names,
            'preprocessor':  self.preprocessor,
            'metrics':       metrics,
        }, metadata_path)

        return metrics, self.model_path

    def get_feature_importance(self) -> dict:
        """Return feature importance as a sorted dict."""
        if self.model is None:
            return {}
        try:
            if hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
                result = {
                    name: round(float(imp), 4)
                    for name, imp in zip(self.feature_names, importances)
                }
                return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
            elif hasattr(self.model, 'coef_'):
                importances = np.abs(self.model.coef_)
                result = {
                    name: round(float(imp), 4)
                    for name, imp in zip(self.feature_names, importances)
                }
                return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
        except Exception:
            pass
        return {}
