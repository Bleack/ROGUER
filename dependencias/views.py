from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    context = {
        'title': 'Dependencias'
    }
    return render(request, 'dependencias/dependencias.html', context)
