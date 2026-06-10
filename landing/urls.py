from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('contacto-landing/', views.contacto_landing, name='contacto_landing'),
    path('contacto-tabla/', views.contacto_lista, name='contacto_tabla'),
    path('contacto-detalle/', views.contacto_detalle, name='contacto_detalle'),
]