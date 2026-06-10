from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from equipos.models import Equipo


@login_required
def index(request):
    equipos = Equipo.objects.filter(estado=1).select_related('categoria').values(
        'id', 'ninv', 'marca', 'modelo', 'categoria__nombre'
    ).order_by('id')
    context = {
        'title': 'Equipos de Baja',
        'equipos': equipos
    }
    return render(request, 'equipos_baja/equipos_baja.html', context)


@require_POST
@login_required
def reactivar_equipo(request):
    equipo_id = request.POST.get('id')
    try:
        equipo = Equipo.objects.get(id=equipo_id, estado=1)
        equipo.estado = 0
        equipo.save()
        return JsonResponse({'ok': True, 'mensaje': 'Equipo reactivado correctamente.'})
    except Equipo.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Equipo no encontrado o no está dado de baja.'}, status=404)
    except Exception:
        return JsonResponse({'ok': False, 'mensaje': 'Error al reactivar el equipo.'}, status=500)