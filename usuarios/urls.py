from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='usuarios'),
    path('crear/', views.UsuarioCreateView.as_view(), name='usuario_crear'),
    path('<int:pk>/editar/', views.UsuarioUpdateView.as_view(), name='usuario_editar'),
    path('lista-json/', views.lista_json, name='usuario_lista_json'),
]