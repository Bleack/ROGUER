from django.db import models
from django.contrib.auth.models import User
from categorias.models import Categoria


class Equipo(models.Model):
    ESTADO_CHOICES = [
        (0, 'Activo'),
        (1, 'De baja'),
    ]

    ninv = models.CharField(max_length=50, verbose_name='N° Inventario')
    nserie = models.CharField(max_length=50, unique=True, verbose_name='N° Serie')
    marca = models.CharField(max_length=100, verbose_name='Marca')
    modelo = models.CharField(max_length=100, verbose_name='Modelo')
    observaciones = models.TextField(blank=True, default='', verbose_name='Observaciones')
    fondos = models.CharField(max_length=100, verbose_name='Fondos')
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, verbose_name='Categoría')
    registrado_por = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Registrado por')
    estado = models.IntegerField(choices=ESTADO_CHOICES, default=0, verbose_name='Estado')
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')

    class Meta:
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'
        ordering = ['id']

    def __str__(self):
        return f"{self.marca} {self.modelo} - {self.nserie}"