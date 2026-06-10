from django.db import models
from equipos.models import Equipo
from usuarios.models import Usuario
from django.contrib.auth.models import User


class Prestamo(models.Model):
    equipo = models.ForeignKey(Equipo, on_delete=models.PROTECT, verbose_name='Equipo')
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, verbose_name='Usuario')
    administrador = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Administrador')
    f_prestamo = models.DateField(verbose_name='Fecha de préstamo')
    f_devolucion = models.DateField(null=True, blank=True, verbose_name='Fecha de devolución')
    observacion = models.TextField(blank=True, default='', verbose_name='Observaciones')
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')

    class Meta:
        verbose_name = 'Préstamo'
        verbose_name_plural = 'Préstamos'
        ordering = ['-f_prestamo', '-id']

    def __str__(self):
        return f"{self.equipo.ninv} - {self.usuario.nombre}"

    @property
    def estado(self):
        return 'Pendiente' if not self.f_devolucion else 'Devuelto'