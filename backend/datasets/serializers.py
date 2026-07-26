from rest_framework import serializers
from .models import Dataset

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ['user', 'rows', 'columns', 'status', 'validation_report', 'cleaning_report', 'uploaded_at', 'cleaned_at']
