from django.db import models


class Usuario(models.Model):
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    rut = models.CharField(max_length=15, unique=True, verbose_name='RUT')

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.nombre

    @property
    def total_prestamos(self):
        return 0

    @property
    def entregas_pendientes(self):
        return 0