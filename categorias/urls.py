from django.urls import path
from .views import (index,CategoriaCreateView,CategoriaUpdateView,)

urlpatterns = [
    path('', index, name='categorias'),
    path('crear/', CategoriaCreateView.as_view(), name='categoria_crear'),
    path('<int:pk>/editar/', CategoriaUpdateView.as_view(), name='categoria_editar'),
]