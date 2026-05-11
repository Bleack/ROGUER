from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    context = {
        'title': 'Equipos Baja'
    }
    return render(request, 'equipos_baja/equipos_baja.html', context)
