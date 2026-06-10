from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import CreateView, UpdateView
from .models import Usuario


@login_required
def index(request):
    context = {
        'title': 'Usuarios',
        'usuarios': Usuario.objects.all()
    }
    return render(request, 'usuarios/usuarios.html', context)


@method_decorator(login_required, name='dispatch')
class UsuarioCreateView(CreateView):
    model = Usuario
    fields = ['nombre', 'rut']

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Usuario registrado correctamente.',
            'data': {
                'id': self.object.id,
                'nombre': self.object.nombre,
                'rut': self.object.rut,
                'total_prestamos': self.object.total_prestamos,
                'entregas_pendientes': self.object.entregas_pendientes
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
class UsuarioUpdateView(UpdateView):
    model = Usuario
    fields = ['nombre', 'rut']

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Usuario actualizado correctamente.',
            'data': {
                'id': self.object.id,
                'nombre': self.object.nombre,
                'rut': self.object.rut,
                'total_prestamos': self.object.total_prestamos,
                'entregas_pendientes': self.object.entregas_pendientes
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