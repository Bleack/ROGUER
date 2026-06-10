from django.urls import path
from .views import index, reactivar_equipo

urlpatterns = [
    path('', index, name='equipos_baja'),
    path('reactivar/', reactivar_equipo, name='equipo_reactivar'),
]