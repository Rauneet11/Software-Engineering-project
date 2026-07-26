from django.urls import path
from . import views

urlpatterns = [
    path('run/', views.RunPredictionView.as_view(), name='run_prediction'),
    path('', views.PredictionListView.as_view(), name='prediction_list'),
    path('<int:pk>/', views.PredictionDetailView.as_view(), name='prediction_detail'),
]
