from django.urls import path
from .views import (index,UsuarioCreateView,UsuarioUpdateView,)

urlpatterns = [
    path('', index, name='usuarios'),
    path('crear/', UsuarioCreateView.as_view(), name='usuario_crear'),
    path('<int:pk>/editar/', UsuarioUpdateView.as_view(), name='usuario_editar'),
]