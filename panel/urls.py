from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='panel'),
    path('datos/', views.obtener_datos, name='panel_datos'),
]