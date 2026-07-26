from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/datasets/', include('datasets.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/scenarios/', include('scenarios.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/dashboard/', include('dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
