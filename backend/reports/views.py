from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.conf import settings
from .models import Report
from .serializers import ReportSerializer
from predictions.models import Prediction
import os

class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prediction_id = request.data.get('prediction_id')
        company_name = request.data.get('company_name', request.user.company or 'Sales Analytics Institute')
        try:
            prediction = Prediction.objects.get(pk=prediction_id)
        except Prediction.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=404)
        try:
            import sys
            sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml'))
            from report_generator import generate_pdf_report
            reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
            os.makedirs(reports_dir, exist_ok=True)
            filename = f'report_{prediction.id}_{request.user.id}.pdf'
            filepath = os.path.join(reports_dir, filename)
            generate_pdf_report(prediction, company_name, filepath)
            file_size = os.path.getsize(filepath)
            relative_path = f'reports/{filename}'
            report = Report.objects.create(
                user=request.user,
                prediction=prediction,
                title=f'Sales Report - {prediction.name}',
                file=relative_path,
                file_size=file_size
            )
            return Response({'message': 'Report generated', 'report': ReportSerializer(report, context={'request': request}).data}, status=201)
        except Exception as e:
            import traceback
            return Response({'error': f'Report generation failed: {str(e)}', 'traceback': traceback.format_exc()}, status=500)

class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Report.objects.all()
        return Report.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

class ReportDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
            response = FileResponse(open(report.file.path, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(report.file.name)}"'
            return response
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=404)
        except FileNotFoundError:
            return Response({'error': 'Report file not found on disk'}, status=404)

class ReportDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)
