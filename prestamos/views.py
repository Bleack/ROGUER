from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils import timezone
from .models import Prestamo
from categorias.models import Categoria
from equipos.models import Equipo
from usuarios.models import Usuario


@login_required
def index(request):
    context = {
        'title': 'Préstamos',
        'categorias': Categoria.objects.all(),
        'usuarios': Usuario.objects.all(),
        'user_name': request.user.get_full_name() or request.user.username,
    }
    return render(request, 'prestamos/prestamos.html', context)


@require_POST
@login_required
def get_equipos_por_categoria(request):
    categoria_id = request.POST.get('id_categoria')
    equipos = list(Equipo.objects.filter(
        categoria_id=categoria_id, estado=0
    ).exclude(
        id__in=Prestamo.objects.filter(f_devolucion__isnull=True).values('equipo_id')
    ).values('id', 'ninv', 'marca', 'modelo'))
    return JsonResponse({'ok': True, 'equipos': equipos})


@require_POST
@login_required
def get_tabla(request):
    prestamos = Prestamo.objects.select_related('equipo__categoria', 'equipo', 'usuario').order_by('-f_prestamo', '-id')
    data = []
    for p in prestamos:
        data.append({
            'id': p.id,
            'categoria': p.equipo.categoria.nombre,
            'marca': p.equipo.marca,
            'nombre_usuario': p.usuario.nombre,
            'estado': p.estado,
            'observacion': p.observacion,
        })
    return JsonResponse({'ok': True, 'prestamos': data})


@require_POST
@login_required
def crear(request):
    equipo_id = request.POST.get('id_equipo')
    usuario_id = request.POST.get('usuario')
    f_prestamo = request.POST.get('f_prestamo')
    observacion = request.POST.get('observacion', '')

    if not equipo_id or not usuario_id or not f_prestamo:
        return JsonResponse({'ok': False, 'mensaje': 'Todos los campos son obligatorios.'}, status=400)

    if Prestamo.objects.filter(usuario_id=usuario_id, f_devolucion__isnull=True).exists():
        return JsonResponse({'ok': False, 'mensaje': 'El usuario tiene un préstamo pendiente sin devolver.'}, status=400)

    if Prestamo.objects.filter(equipo_id=equipo_id, f_devolucion__isnull=True).exists():
        return JsonResponse({'ok': False, 'mensaje': 'El equipo seleccionado ya está prestado.'}, status=400)

    try:
        Equipo.objects.get(id=equipo_id, estado=0)
    except Equipo.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'El equipo no existe o no está activo.'}, status=400)

    try:
        Prestamo.objects.create(
            equipo_id=equipo_id,
            usuario_id=usuario_id,
            administrador=request.user,
            f_prestamo=f_prestamo,
            observacion=observacion
        )
        return JsonResponse({'ok': True, 'mensaje': 'Préstamo registrado correctamente.'}, status=201)
    except Exception:
        return JsonResponse({'ok': False, 'mensaje': 'Error al registrar el préstamo.'}, status=500)


@require_POST
@login_required
def devolver(request):
    prestamo_id = request.POST.get('id_prestamo')
    if not prestamo_id:
        return JsonResponse({'ok': False, 'mensaje': 'ID de préstamo no proporcionado.'}, status=400)
    try:
        prestamo = Prestamo.objects.get(id=prestamo_id, f_devolucion__isnull=True)
        prestamo.f_devolucion = timezone.now().date()
        prestamo.save()
        return JsonResponse({'ok': True, 'mensaje': 'Equipo devuelto correctamente.'})
    except Prestamo.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Préstamo no encontrado o ya devuelto.'}, status=404)
    except Exception:
        return JsonResponse({'ok': False, 'mensaje': 'Error al devolver el equipo.'}, status=500)