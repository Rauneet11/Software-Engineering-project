from rest_framework import serializers
from .models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    dataset_name = serializers.CharField(source='dataset.name', read_only=True)

    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ['user', 'mae', 'rmse', 'r2_score', 'mape', 'result_json', 'feature_importance', 'recommendations', 'created_at']
