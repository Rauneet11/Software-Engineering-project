"""
Data Preprocessor Module
Handles all data cleaning and feature engineering for the ML pipeline.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import warnings
warnings.filterwarnings('ignore')


class DataPreprocessor:
    """Complete data cleaning and feature engineering pipeline."""

    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()

    def clean(self, df: pd.DataFrame) -> tuple:
        """
        Main cleaning pipeline.
        Returns: (cleaned_df, cleaning_report)
        """
        report = {'original_rows': len(df), 'steps': []}
        df = df.copy()

        # 1. Standardize column names
        df.columns = [str(c).lower().strip().replace(' ', '_') for c in df.columns]

        # 2. Remove duplicates
        before = len(df)
        df = df.drop_duplicates()
        removed_dupes = before - len(df)
        report['steps'].append({'step': 'Remove Duplicates', 'rows_removed': removed_dupes})

        # 3. Handle date column
        date_col = self._find_column(df, ['date', 'sale_date', 'order_date', 'transaction_date'])
        if date_col:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            df['month']      = df[date_col].dt.month
            df['year']       = df[date_col].dt.year
            df['quarter']    = df[date_col].dt.quarter
            df['day_of_week']= df[date_col].dt.dayofweek
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
            report['steps'].append({
                'step': 'Date Features Extracted',
                'columns_added': ['month', 'year', 'quarter', 'day_of_week', 'is_weekend']
            })

        # 4. Handle missing numerical values with median
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        nulls_filled = 0
        for col in num_cols:
            nulls = df[col].isnull().sum()
            if nulls > 0:
                df[col] = df[col].fillna(df[col].median())
                nulls_filled += nulls
        if nulls_filled:
            report['steps'].append({'step': 'Fill Missing Numerical Values', 'values_filled': int(nulls_filled)})

        # 5. Handle missing categorical values with mode
        cat_cols = df.select_dtypes(include=['object']).columns.tolist()
        for col in cat_cols:
            if col != date_col:
                mode_val = df[col].mode()
                fill_val = mode_val[0] if not mode_val.empty else 'Unknown'
                df[col] = df[col].fillna(fill_val)

        # 6. Remove outliers using IQR on revenue/quantity
        outlier_col = self._find_column(df, ['revenue', 'sales', 'quantity', 'amount'])
        if outlier_col:
            before = len(df)
            Q1  = df[outlier_col].quantile(0.25)
            Q3  = df[outlier_col].quantile(0.75)
            IQR = Q3 - Q1
            df = df[(df[outlier_col] >= Q1 - 3 * IQR) & (df[outlier_col] <= Q3 + 3 * IQR)]
            removed_outliers = before - len(df)
            report['steps'].append({
                'step': 'Remove Outliers',
                'rows_removed': removed_outliers,
                'column': outlier_col
            })

        # 7. Ensure non-negative values for numeric business fields
        for col in ['quantity', 'revenue', 'price', 'amount', 'sales']:
            if col in df.columns:
                df[col] = df[col].abs()

        report['cleaned_rows']    = len(df)
        report['columns_final']   = list(df.columns)
        report['status']          = 'success'

        return df, report

    def _find_column(self, df, candidates):
        """Find a column by checking multiple possible names."""
        for candidate in candidates:
            if candidate in df.columns:
                return candidate
        return None

    def prepare_features(self, df: pd.DataFrame, target_col: str = 'revenue'):
        """Prepare feature matrix and target vector for ML training."""
        df = df.copy()
        # Drop date columns (keep extracted features)
        date_cols = [c for c in df.columns if 'date' in c.lower()]
        df = df.drop(columns=date_cols, errors='ignore')

        # Encode categorical columns
        cat_cols = df.select_dtypes(include=['object']).columns.tolist()
        for col in cat_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.label_encoders[col] = le

        # Separate target from features
        if target_col not in df.columns:
            for alt in ['sales', 'amount', 'total', 'revenue_amount']:
                if alt in df.columns:
                    target_col = alt
                    break

        if target_col in df.columns:
            y = df[target_col].values
            X = df.drop(columns=[target_col])
        else:
            y = df.iloc[:, -1].values
            X = df.iloc[:, :-1]

        return X, y, list(X.columns)
