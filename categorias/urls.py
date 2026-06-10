from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='categorias'),
    path('crear/', views.CategoriaCreateView.as_view(), name='categoria_crear'),
    path('<int:pk>/editar/', views.CategoriaUpdateView.as_view(), name='categoria_editar'),
    path('lista-json/', views.lista_json, name='categoria_lista_json'),
]