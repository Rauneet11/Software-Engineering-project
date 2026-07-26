from django.db import models
from accounts.models import User
from datasets.models import Dataset

class Prediction(models.Model):
    MODEL_CHOICES = [('xgboost', 'XGBoost'), ('linear', 'Linear Regression'), ('random_forest', 'Random Forest')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, related_name='predictions')
    name = models.CharField(max_length=200, default='Prediction')
    model_type = models.CharField(max_length=30, choices=MODEL_CHOICES, default='xgboost')
    forecast_months = models.IntegerField(default=6)
    mae = models.FloatField(null=True, blank=True)
    rmse = models.FloatField(null=True, blank=True)
    r2_score = models.FloatField(null=True, blank=True)
    mape = models.FloatField(null=True, blank=True)
    result_json = models.JSONField(default=dict)
    feature_importance = models.JSONField(default=dict, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='completed')

    def __str__(self):
        return f'{self.name} by {self.user.username}'

    class Meta:
        ordering = ['-created_at']
