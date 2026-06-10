from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.db.models import Count, Q
from .models import Dependencia, EquipoDependencia
from equipos.models import Equipo
from categorias.models import Categoria


@login_required
def index(request):
    datos_pisos = {1: {'total_dependencias': 0, 'total_equipos': 0},
                   2: {'total_dependencias': 0, 'total_equipos': 0},
                   3: {'total_dependencias': 0, 'total_equipos': 0}}
    total_dependencias = 0
    total_equipos = 0

    deps = Dependencia.objects.all()
    for dep in deps:
        count = EquipoDependencia.objects.filter(dependencia=dep).count()
        datos_pisos[dep.piso]['total_dependencias'] += 1
        datos_pisos[dep.piso]['total_equipos'] += count
        total_dependencias += 1
        total_equipos += count

    context = {
        'title': 'Dependencias',
        'datos_pisos': datos_pisos,
        'total_dependencias': total_dependencias,
        'total_equipos': total_equipos,
    }
    return render(request, 'dependencias/dependencias.html', context)


@require_POST
@login_required
def get_tabla(request):
    piso = request.POST.get('piso', '')
    queryset = Dependencia.objects.annotate(
        total_equipos=Count('equipodependencia')
    ).order_by('piso', 'nombre')

    if piso in ['1', '2', '3']:
        queryset = queryset.filter(piso=int(piso))

    data = []
    for dep in queryset:
        data.append({
            'id': dep.id,
            'nombre': dep.nombre,
            'piso': f'Piso {dep.piso}',
            'total_equipos': dep.total_equipos,
        })
    return JsonResponse({'ok': True, 'dependencias': data})


@require_POST
@login_required
def get_equipos(request):
    dep_id = request.POST.get('id_dependencia')
    try:
        dependencia = Dependencia.objects.get(id=dep_id)
    except Dependencia.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Dependencia no encontrada.'}, status=404)

    asignados = list(EquipoDependencia.objects.filter(
        dependencia=dependencia
    ).select_related('equipo', 'equipo__categoria').values(
        'id', 'equipo__id', 'equipo__ninv', 'equipo__nserie',
        'equipo__marca', 'equipo__modelo', 'equipo__fondos',
        'equipo__categoria__nombre', 'equipo__categoria__id'
    ))

    asignados_data = []
    for a in asignados:
        asignados_data.append({
            'id_registro': a['id'],
            'id': a['equipo__id'],
            'ninv': a['equipo__ninv'],
            'nserie': a['equipo__nserie'],
            'marca': a['equipo__marca'],
            'modelo': a['equipo__modelo'],
            'fondos': a['equipo__fondos'],
            'categoria': a['equipo__categoria__nombre'],
            'id_categoria': a['equipo__categoria__id'],
        })

    equipos_en_prestamo = EquipoDependencia.objects.filter(
        equipo__prestamo__f_devolucion__isnull=True
    ).values_list('equipo_id', flat=True)

    libres = list(Equipo.objects.filter(
        estado=0
    ).exclude(
        id__in=EquipoDependencia.objects.values('equipo_id')
    ).exclude(
        id__in=equipos_en_prestamo
    ).select_related('categoria').values(
        'id', 'ninv', 'nserie', 'marca', 'modelo', 'fondos',
        'categoria__nombre', 'categoria__id'
    ))

    libres_data = []
    for e in libres:
        libres_data.append({
            'id': e['id'],
            'ninv': e['ninv'],
            'nserie': e['nserie'],
            'marca': e['marca'],
            'modelo': e['modelo'],
            'fondos': e['fondos'],
            'categoria': e['categoria__nombre'],
            'id_categoria': e['categoria__id'],
        })

    categorias = list(Categoria.objects.all().values('id', 'nombre'))

    return JsonResponse({
        'ok': True,
        'equipos_asignados': asignados_data,
        'equipos_libres': libres_data,
        'categorias': categorias,
    })


@require_POST
@login_required
def gestionar_equipos(request):
    accion = request.POST.get('action')
    dep_id = request.POST.get('id_dependencia')
    equipo_id = request.POST.get('id_equipo')

    if not accion or not dep_id or not equipo_id:
        return JsonResponse({'ok': False, 'mensaje': 'Parámetros incompletos.'}, status=400)

    try:
        dependencia = Dependencia.objects.get(id=dep_id)
    except Dependencia.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Dependencia no encontrada.'}, status=404)

    try:
        equipo = Equipo.objects.get(id=equipo_id)
    except Equipo.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Equipo no encontrado.'}, status=404)

    if accion == 'asignar':
        if EquipoDependencia.objects.filter(dependencia=dependencia, equipo=equipo).exists():
            return JsonResponse({'ok': False, 'mensaje': 'El equipo ya está asignado a esta dependencia.'})
        EquipoDependencia.objects.create(dependencia=dependencia, equipo=equipo)
        return JsonResponse({'ok': True, 'mensaje': 'Equipo asignado correctamente.'})

    elif accion == 'eliminar':
        registro = EquipoDependencia.objects.filter(dependencia=dependencia, equipo=equipo).first()
        if not registro:
            return JsonResponse({'ok': False, 'mensaje': 'El equipo no está asignado a esta dependencia.'})
        registro.delete()
        return JsonResponse({'ok': True, 'mensaje': 'Equipo eliminado de la dependencia.'})

    return JsonResponse({'ok': False, 'mensaje': 'Acción no válida.'}, status=400)