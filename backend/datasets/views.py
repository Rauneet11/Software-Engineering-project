from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Dataset
from .serializers import DatasetSerializer
import pandas as pd
import json
import io

def validate_csv(df):
    """Validate uploaded CSV for required columns and data quality."""
    report = {'errors': [], 'warnings': [], 'stats': {}}
    required_cols = ['product', 'quantity', 'revenue', 'date']
    missing = [c for c in required_cols if c.lower() not in [col.lower() for col in df.columns]]
    if missing:
        report['errors'].append(f'Missing required columns: {missing}')
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        report['warnings'].append(f'{duplicates} duplicate rows found')
    null_counts = df.isnull().sum().to_dict()
    total_nulls = sum(null_counts.values())
    if total_nulls > 0:
        report['warnings'].append(f'{total_nulls} missing values found')
    report['stats'] = {
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'duplicate_rows': int(duplicates),
        'missing_values': {k: int(v) for k, v in null_counts.items() if v > 0},
        'columns': list(df.columns),
    }
    return report

class DatasetUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=400)
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({'error': 'Only CSV files allowed'}, status=400)
        try:
            df = pd.read_csv(file)
            report = validate_csv(df)
            if report['errors']:
                return Response({'error': 'Validation failed', 'details': report}, status=400)
            file.seek(0)
            dataset = Dataset.objects.create(
                user=request.user,
                name=file.name,
                file=file,
                rows=len(df),
                columns=len(df.columns),
                validation_report=report,
                status='uploaded'
            )
            return Response({'message': 'Dataset uploaded successfully', 'dataset': DatasetSerializer(dataset).data}, status=201)
        except Exception as e:
            return Response({'error': f'Failed to process file: {str(e)}'}, status=400)

class DatasetCleanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk, user=request.user)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=404)
        try:
            import sys, os
            sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml'))
            from preprocessor import DataPreprocessor
            df = pd.read_csv(dataset.file.path)
            preprocessor = DataPreprocessor()
            cleaned_df, cleaning_report = preprocessor.clean(df)
            cleaned_path = dataset.file.path.replace('datasets/', 'cleaned_datasets/').replace('.csv', '_cleaned.csv')
            os.makedirs(os.path.dirname(cleaned_path), exist_ok=True)
            cleaned_df.to_csv(cleaned_path, index=False)
            dataset.status = 'cleaned'
            dataset.cleaned_file = cleaned_path.split('media/')[-1]
            dataset.cleaning_report = cleaning_report
            dataset.cleaned_at = timezone.now()
            dataset.rows = len(cleaned_df)
            dataset.save()
            return Response({'message': 'Data cleaned successfully', 'dataset': DatasetSerializer(dataset).data, 'cleaning_report': cleaning_report})
        except Exception as e:
            dataset.status = 'error'
            dataset.save()
            return Response({'error': f'Cleaning failed: {str(e)}'}, status=500)

class DatasetListView(generics.ListAPIView):
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Dataset.objects.all()
        return Dataset.objects.filter(user=self.request.user)

class DatasetDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Dataset.objects.all()
        return Dataset.objects.filter(user=self.request.user)

class DatasetPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            file_to_read = dataset.cleaned_file if dataset.cleaned_file else dataset.file
            df = pd.read_csv(file_to_read.path)
            preview_data = df.head(50).fillna('').to_dict(orient='records')
            stats = {
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': list(df.columns),
                'dtypes': {k: str(v) for k, v in df.dtypes.items()},
                'describe': json.loads(df.describe().fillna(0).to_json()),
            }
            return Response({'preview': preview_data, 'stats': stats})
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
