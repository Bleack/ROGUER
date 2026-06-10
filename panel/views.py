from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from equipos.models import Equipo
from prestamos.models import Prestamo
from dependencias.models import EquipoDependencia


@login_required
def index(request):
    return render(request, 'panel/inicio.html', {'title': 'Panel'})


@login_required
def obtener_datos(request):
    equipos_totales = Equipo.objects.filter(estado=0).count()
    equipos_prestados = Prestamo.objects.filter(f_devolucion__isnull=True).count()
    equipos_en_oficinas = EquipoDependencia.objects.values('equipo_id').distinct().count()
    
    devueltos = Prestamo.objects.filter(f_devolucion__isnull=False).count()
    no_devueltos = equipos_prestados

    equipos_por_cat = list(
        Equipo.objects.filter(estado=0).values('categoria__nombre').annotate(
            total=Count('id')
        ).order_by('-total')
    )

    prestamos_por_cat = list(
        Prestamo.objects.filter(f_devolucion__isnull=True).values(
            'equipo__categoria__nombre'
        ).annotate(total=Count('id')).order_by('-total')
    )

    top_usuarios = list(
        Prestamo.objects.values('usuario__nombre').annotate(
            total=Count('id')
        ).order_by('-total')[:5]
    )

    return JsonResponse({
        'resumen': {
            'equipos_totales': equipos_totales,
            'equipos_prestados': equipos_prestados,
            'equipos_en_oficinas': equipos_en_oficinas,
            'prestamos_activos': equipos_prestados,
        },
        'devoluciones': {
            'devuelto': devueltos,
            'no_devuelto': no_devueltos
        },
        'equipos_por_categoria': [
            {'nombre': c['categoria__nombre'] if c['categoria__nombre'] else 'Sin categoría', 'total': c['total']} 
            for c in equipos_por_cat
        ],
        'prestamos_por_categoria': [
            {'nombre': c['equipo__categoria__nombre'] if c['equipo__categoria__nombre'] else 'Sin categoría', 'total': c['total']} 
            for c in prestamos_por_cat
        ],
        'top_usuarios': [
            {'nombre': u['usuario__nombre'], 'total': u['total']} 
            for u in top_usuarios
        ]
    })