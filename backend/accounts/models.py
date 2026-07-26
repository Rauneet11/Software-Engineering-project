from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Store Manager'),
        ('analyst', 'Marketing Analyst'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='manager')
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True, default='Sales Analytics Institute')
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.username} ({self.role})'
