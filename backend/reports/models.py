from django.db import models
from accounts.models import User
from predictions.models import Prediction

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    prediction = models.ForeignKey(Prediction, on_delete=models.SET_NULL, null=True, related_name='reports')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='reports/')
    file_size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
