from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, UpdateView
from django.db.models import Count, Q
from categorias.models import Categoria
from .models import Equipo


@login_required
def index(request):
    categorias = Categoria.objects.annotate(
        total_equipos=Count('equipo', filter=Q(equipo__estado=0))
    )
    context = {
        'title': 'Equipos',
        'categorias': categorias,
        'user_name': request.user.get_full_name() or request.user.username,
    }
    return render(request, 'equipos/equipos.html', context)


@require_POST
@login_required
def get_tabla(request):
    categoria_id = request.POST.get('categoria')
    equipos = list(Equipo.objects.filter(
        categoria_id=categoria_id, estado=0
    ).values('id', 'ninv', 'nserie', 'marca', 'modelo', 'fondos', 'observaciones'))
    return JsonResponse({'ok': True, 'equipos': equipos})


@require_POST
@login_required
def get_equipo(request):
    equipo_id = request.POST.get('id_equipo')
    equipo = Equipo.objects.select_related('registrado_por').get(id=equipo_id)
    return JsonResponse({
        'ok': True,
        'equipo': {
            'id': equipo.id,
            'ninv': equipo.ninv,
            'nserie': equipo.nserie,
            'marca': equipo.marca,
            'modelo': equipo.modelo,
            'fondos': equipo.fondos,
            'observaciones': equipo.observaciones,
            'nombre_adm': equipo.registrado_por.get_full_name() or equipo.registrado_por.username,
        }
    })


@method_decorator(login_required, name='dispatch')
class EquipoCreateView(CreateView):
    model = Equipo
    fields = ['ninv', 'nserie', 'marca', 'modelo', 'fondos', 'observaciones', 'categoria']

    def form_valid(self, form):
        form.instance.registrado_por = self.request.user
        form.instance.estado = 0
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Equipo registrado correctamente.'
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
class EquipoUpdateView(UpdateView):
    model = Equipo
    fields = ['marca', 'modelo', 'observaciones']

    def form_valid(self, form):
        self.object = form.save()
        return JsonResponse({
            'ok': True,
            'mensaje': 'Equipo actualizado correctamente.'
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

@require_POST
@login_required
def dar_baja(request):
    equipo_id = request.POST.get('id_equipo')
    try:
        equipo = Equipo.objects.get(id=equipo_id)
        equipo.estado = 1
        equipo.save()
        return JsonResponse({'ok': True, 'mensaje': 'Equipo dado de baja correctamente.'})
    except Equipo.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Equipo no encontrado.'}, status=404)
    except Exception:
        return JsonResponse({'ok': False, 'mensaje': 'Error al dar de baja.'}, status=500)