from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='dependencias'),
    path('get-tabla/', views.get_tabla, name='dependencia_get_tabla'),
    path('get-equipos/', views.get_equipos, name='dependencia_get_equipos'),
    path('gestionar-equipos/', views.gestionar_equipos, name='dependencia_gestionar_equipos'),
]