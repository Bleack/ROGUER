from django.db import models


class BajaEquipo(models.Model):
    equipo = models.ForeignKey(
        'equipos.Equipo',
        on_delete=models.CASCADE,
        related_name='registros_baja',
        verbose_name='Equipo'
    )
    fecha_baja = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de baja')

    class Meta:
        verbose_name = 'Registro de baja'
        verbose_name_plural = 'Registros de baja'
        ordering = ['-fecha_baja']

    def __str__(self):
        return f"{self.equipo.ninv} - {self.fecha_baja.strftime('%d/%m/%Y %H:%M')}"