from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ScenarioSimulation
from .serializers import ScenarioSerializer
from predictions.models import Prediction
import numpy as np

def simulate_revenue(base_revenue, marketing_budget, product_price, discount_percent, expected_demand):
    """Rule-based simulation engine."""
    marketing_factor = 1 + (marketing_budget / 500000) * 0.25  # Every 500k budget = 25% boost
    price_factor = 1 - (discount_percent / 100) * 0.5  # Discount reduces revenue
    demand_factor = expected_demand / 500  # Normalized demand
    effective_price = product_price * (1 - discount_percent / 100)
    simulated_revenue = base_revenue * marketing_factor * price_factor * demand_factor
    simulated_revenue = max(simulated_revenue, 0)
    return {
        'simulated_revenue': round(simulated_revenue, 2),
        'marketing_impact': round((marketing_factor - 1) * 100, 2),
        'discount_impact': round((price_factor - 1) * 100, 2),
        'demand_impact': round((demand_factor - 1) * 100, 2),
        'effective_price': round(effective_price, 2),
    }

class SimulateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prediction_id = request.data.get('prediction_id')
        marketing_budget = float(request.data.get('marketing_budget', 100000))
        product_price = float(request.data.get('product_price', 1000))
        discount_percent = float(request.data.get('discount_percent', 10))
        expected_demand = float(request.data.get('expected_demand', 500))
        scenario_name = request.data.get('name', 'Scenario')
        try:
            prediction = Prediction.objects.get(pk=prediction_id)
            result_json = prediction.result_json
            forecast = result_json.get('forecast', [])
            base_revenue = sum([f.get('predicted_revenue', 0) for f in forecast]) if forecast else result_json.get('total_predicted_revenue', 100000)
        except Prediction.DoesNotExist:
            base_revenue = float(request.data.get('base_revenue', 100000))
            prediction = None
        sim = simulate_revenue(base_revenue, marketing_budget, product_price, discount_percent, expected_demand)
        simulated_revenue = sim['simulated_revenue']
        diff = simulated_revenue - base_revenue
        change_pct = (diff / base_revenue * 100) if base_revenue > 0 else 0
        scenario = ScenarioSimulation.objects.create(
            user=request.user,
            prediction=prediction,
            name=scenario_name,
            marketing_budget=marketing_budget,
            product_price=product_price,
            discount_percent=discount_percent,
            expected_demand=expected_demand,
            base_revenue=base_revenue,
            simulated_revenue=simulated_revenue,
            revenue_difference=round(diff, 2),
            revenue_change_percent=round(change_pct, 2),
            simulation_details=sim
        )
        return Response({'message': 'Simulation complete', 'scenario': ScenarioSerializer(scenario).data}, status=201)

class ScenarioListView(generics.ListAPIView):
    serializer_class = ScenarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ScenarioSimulation.objects.all()
        return ScenarioSimulation.objects.filter(user=self.request.user)

class ScenarioDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ScenarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ScenarioSimulation.objects.all()
        return ScenarioSimulation.objects.filter(user=self.request.user)
