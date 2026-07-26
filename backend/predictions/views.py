from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml'))
from .models import Prediction
from .serializers import PredictionSerializer
from datasets.models import Dataset

class RunPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        dataset_id = request.data.get('dataset_id')
        model_type = request.data.get('model_type', 'xgboost')
        forecast_months = int(request.data.get('forecast_months', 6))
        prediction_name = request.data.get('name', f'Prediction {Prediction.objects.count() + 1}')
        try:
            dataset = Dataset.objects.get(pk=dataset_id)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=404)
        try:
            from model_trainer import ModelTrainer
            from predictor import SalesPredictor
            from recommender import RecommendationEngine
            file_path = dataset.cleaned_file.path if dataset.cleaned_file else dataset.file.path
            trainer = ModelTrainer(model_type=model_type)
            metrics, model_path = trainer.train(file_path)
            predictor = SalesPredictor(model_path=model_path)
            results = predictor.predict(file_path, forecast_months=forecast_months)
            engine = RecommendationEngine()
            recommendations = engine.generate(results)
            feature_imp = trainer.get_feature_importance()
            prediction = Prediction.objects.create(
                user=request.user,
                dataset=dataset,
                name=prediction_name,
                model_type=model_type,
                forecast_months=forecast_months,
                mae=metrics.get('mae'),
                rmse=metrics.get('rmse'),
                r2_score=metrics.get('r2'),
                mape=metrics.get('mape'),
                result_json=results,
                feature_importance=feature_imp,
                recommendations=recommendations,
                status='completed'
            )
            return Response({'message': 'Prediction completed', 'prediction': PredictionSerializer(prediction).data}, status=201)
        except Exception as e:
            import traceback
            return Response({'error': f'Prediction failed: {str(e)}', 'traceback': traceback.format_exc()}, status=500)

class PredictionListView(generics.ListAPIView):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Prediction.objects.all() if self.request.user.role == 'admin' else Prediction.objects.filter(user=self.request.user)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(model_type__icontains=search))
        return qs

class PredictionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Prediction.objects.all()
        return Prediction.objects.filter(user=self.request.user)
