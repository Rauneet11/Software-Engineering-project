"""
Create default demo users for the platform.
Run: python create_admin.py (from backend/ directory)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

users_to_create = [
    {
        'username':  'admin',
        'email':     'admin@salesanalytics.com',
        'password':  'admin123',
        'role':      'admin',
        'first_name':'Platform',
        'last_name': 'Admin',
        'superuser': True,
    },
    {
        'username':  'manager',
        'email':     'manager@salesanalytics.com',
        'password':  'manager123',
        'role':      'manager',
        'first_name':'Store',
        'last_name': 'Manager',
    },
    {
        'username':  'analyst',
        'email':     'analyst@salesanalytics.com',
        'password':  'analyst123',
        'role':      'analyst',
        'first_name':'Marketing',
        'last_name': 'Analyst',
    },
]

for u in users_to_create:
    if not User.objects.filter(username=u['username']).exists():
        if u.get('superuser'):
            user = User.objects.create_superuser(
                username=u['username'], email=u['email'], password=u['password'],
                role=u['role'], first_name=u['first_name'], last_name=u['last_name']
            )
        else:
            user = User.objects.create_user(
                username=u['username'], email=u['email'], password=u['password'],
                role=u['role'], first_name=u['first_name'], last_name=u['last_name']
            )
        print(f"Created: {u['username']} ({u['role']}) / password: {u['password']}")
    else:
        print(f"Already exists: {u['username']}")

print("\nDemo users ready!")
print("---")
print("admin   / admin123   (Admin)")
print("manager / manager123 (Store Manager)")
print("analyst / analyst123 (Marketing Analyst)")
