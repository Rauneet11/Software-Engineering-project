from django.db import models
from accounts.models import User
from predictions.models import Prediction

class ScenarioSimulation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scenarios')
    prediction = models.ForeignKey(Prediction, on_delete=models.SET_NULL, null=True, related_name='scenarios')
    name = models.CharField(max_length=200, default='Scenario')
    marketing_budget = models.FloatField(default=100000)
    product_price = models.FloatField(default=1000)
    discount_percent = models.FloatField(default=10)
    expected_demand = models.FloatField(default=500)
    base_revenue = models.FloatField(null=True, blank=True)
    simulated_revenue = models.FloatField(null=True, blank=True)
    revenue_difference = models.FloatField(null=True, blank=True)
    revenue_change_percent = models.FloatField(null=True, blank=True)
    simulation_details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.user.username})'
