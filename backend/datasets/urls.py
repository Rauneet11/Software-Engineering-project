from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.DatasetUploadView.as_view(), name='dataset_upload'),
    path('', views.DatasetListView.as_view(), name='dataset_list'),
    path('<int:pk>/', views.DatasetDetailView.as_view(), name='dataset_detail'),
    path('<int:pk>/clean/', views.DatasetCleanView.as_view(), name='dataset_clean'),
    path('<int:pk>/preview/', views.DatasetPreviewView.as_view(), name='dataset_preview'),
]
