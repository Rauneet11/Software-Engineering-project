from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['user', 'file', 'file_size', 'created_at']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
