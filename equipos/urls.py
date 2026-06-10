from django.urls import path
from .views import (index,get_tabla,get_equipo,dar_baja,EquipoCreateView,EquipoUpdateView,
)

urlpatterns = [
    path('', index, name='equipos'),
    path('tabla/', get_tabla, name='equipo_tabla'),
    path('obtener/', get_equipo, name='equipo_obtener'),
    path('crear/', EquipoCreateView.as_view(), name='equipo_crear'),
    path('<int:pk>/editar/', EquipoUpdateView.as_view(), name='equipo_editar'),
    path('dar-baja/', dar_baja, name='equipo_dar_baja'),
]