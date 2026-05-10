from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def vista_panel(request):
    return render(request, 'panel/inicio.html')