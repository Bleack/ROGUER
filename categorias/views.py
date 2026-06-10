from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import CreateView, UpdateView
from .models import Categoria


@login_required
def index(request):
    context = {
        'title': 'Categorías',
        'categorias': Categoria.objects.all()
    }
    return render(request, 'categorias/categorias.html', context)

def lista_json(request):
    categorias = list(Categoria.objects.values('id', 'nombre').order_by('nombre'))
    return JsonResponse({'results': categorias})
    
@method_decorator(login_required, name='dispatch')
class CategoriaCreateView(CreateView):
    model = Categoria
    fields = ['nombre']

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Categoría registrada correctamente.',
            'data': {
                'id': self.object.id,
                'nombre': self.object.nombre,
                'total_equipos': self.object.cantidad_equipos
            }
        }, status=201)

    def form_invalid(self, form):
        errores = {}
        for campo, lista_errores in form.errors.items():
            errores[campo] = lista_errores[0]
        return JsonResponse({
            'ok': False,
            'errores': errores,
            'mensaje_global': 'Corrige los campos marcados.'
        }, status=400)


@method_decorator(login_required, name='dispatch')
class CategoriaUpdateView(UpdateView):
    model = Categoria
    fields = ['nombre']

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Categoría actualizada correctamente.',
            'data': {
                'id': self.object.id,
                'nombre': self.object.nombre,
                'total_equipos': self.object.cantidad_equipos
            }
        }, status=200)

    def form_invalid(self, form):
        errores = {}
        for campo, lista_errores in form.errors.items():
            errores[campo] = lista_errores[0]
        return JsonResponse({
            'ok': False,
            'errores': errores,
            'mensaje_global': 'Corrige los campos marcados.'
        }, status=400)