from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.GenerateReportView.as_view(), name='generate_report'),
    path('', views.ReportListView.as_view(), name='report_list'),
    path('<int:pk>/download/', views.ReportDownloadView.as_view(), name='report_download'),
    path('<int:pk>/delete/', views.ReportDeleteView.as_view(), name='report_delete'),
]
