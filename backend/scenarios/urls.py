from django.urls import path
from . import views

urlpatterns = [
    path('simulate/', views.SimulateView.as_view(), name='simulate'),
    path('', views.ScenarioListView.as_view(), name='scenario_list'),
    path('<int:pk>/', views.ScenarioDetailView.as_view(), name='scenario_detail'),
]
