from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    context = {
        'title': 'Usuarios'
    }
    return render(request, 'usuarios/usuarios.html', context)
