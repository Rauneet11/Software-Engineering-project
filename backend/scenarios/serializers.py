from rest_framework import serializers
from .models import ScenarioSimulation

class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioSimulation
        fields = '__all__'
        read_only_fields = ['user', 'base_revenue', 'simulated_revenue', 'revenue_difference', 'revenue_change_percent', 'simulation_details', 'created_at']
