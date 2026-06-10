from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('contacto-landing/', views.contacto_landing, name='contacto_landing'),
]