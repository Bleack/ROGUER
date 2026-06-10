from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='prestamos'),
    path('get-equipos/', views.get_equipos_por_categoria, name='prestamo_get_equipos'),
    path('get-tabla/', views.get_tabla, name='prestamo_get_tabla'),
    path('crear/', views.crear, name='prestamo_crear'),
    path('devolver/', views.devolver, name='prestamo_devolver'),
]