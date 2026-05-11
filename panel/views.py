from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required


def vista_panel(request):
    context = {
        'title': 'Panel'
    }
    
    return render(request, 'panel/inicio.html', context)