from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .models import ContactoLanding


def landing(request):
    return render(request, 'landing/landing.html')


@require_POST
@csrf_exempt
def contacto_landing(request):
    nombre = request.POST.get('nombre_completo', '').strip()
    email = request.POST.get('email', '').strip()
    empresa = request.POST.get('empresa', '').strip()
    telefono = request.POST.get('telefono', '').strip()
    asunto = request.POST.get('asunto', '').strip()
    mensaje = request.POST.get('mensaje', '').strip()

    errores = {}

    if not nombre:
        errores['nombre_completo'] = 'El nombre es obligatorio.'
    elif len(nombre) < 3:
        errores['nombre_completo'] = 'El nombre debe tener al menos 3 caracteres.'

    if not email:
        errores['email'] = 'El email es obligatorio.'
    else:
        if '@' not in email or '.' not in email.split('@')[-1]:
            errores['email'] = 'Ingresa un email válido.'

    if not asunto:
        errores['asunto'] = 'Debes seleccionar un asunto.'
    elif asunto not in dict(ContactoLanding.ASUNTO_CHOICES):
        errores['asunto'] = 'Asunto no válido.'

    if not mensaje:
        errores['mensaje'] = 'El mensaje es obligatorio.'
    elif len(mensaje) < 10:
        errores['mensaje'] = 'El mensaje debe tener al menos 10 caracteres.'

    if errores:
        return JsonResponse({
            'ok': False,
            'errores': errores,
            'mensaje_global': 'Por favor, corrige los campos marcados.'
        }, status=400)

    try:
        ContactoLanding.objects.create(
            nombre_completo=nombre,
            email=email,
            empresa=empresa,
            telefono=telefono,
            asunto=asunto,
            mensaje=mensaje,
        )
        return JsonResponse({
            'ok': True,
            'mensaje': f'¡Gracias {nombre}! Hemos recibido tu mensaje correctamente. Te contactaremos pronto.'
        }, status=201)
    except Exception:
        return JsonResponse({
            'ok': False,
            'mensaje_global': 'Ocurrió un error inesperado. Intenta nuevamente.'
        }, status=500)


@login_required
def contacto_lista(request):
    contactos = ContactoLanding.objects.all().order_by('-id')
    return render(request, 'landing/contacto_lista.html', {
        'title': 'Contactos recibidos',
        'contactos': contactos
    })


@require_POST
@csrf_exempt
def contacto_detalle(request):
    contacto_id = request.POST.get('id')
    try:
        contacto = ContactoLanding.objects.get(id=contacto_id)
    except ContactoLanding.DoesNotExist:
        return JsonResponse({'ok': False, 'mensaje': 'Registro no encontrado.'}, status=404)
    
    return JsonResponse({
        'ok': True,
        'data': {
            'id': contacto.id,
            'nombre_completo': contacto.nombre_completo,
            'email': contacto.email,
            'empresa': contacto.empresa,
            'telefono': contacto.telefono,
            'asunto': contacto.get_asunto_display(),
            'mensaje': contacto.mensaje,
            'fecha_registro': contacto.fecha_registro.strftime('%d/%m/%Y %H:%M')
        }
    })