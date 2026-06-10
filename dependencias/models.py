from django.db import models


class Dependencia(models.Model):
    PISO_CHOICES = [
        (1, 'Primer Piso'),
        (2, 'Segundo Piso'),
        (3, 'Tercer Piso'),
    ]

    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    piso = models.IntegerField(choices=PISO_CHOICES, verbose_name='Piso')

    class Meta:
        verbose_name = 'Dependencia'
        verbose_name_plural = 'Dependencias'
        ordering = ['piso', 'nombre']

    def __str__(self):
        return f"{self.nombre} - Piso {self.piso}"


class EquipoDependencia(models.Model):
    equipo = models.ForeignKey('equipos.Equipo', on_delete=models.CASCADE, verbose_name='Equipo')
    dependencia = models.ForeignKey(Dependencia, on_delete=models.CASCADE, verbose_name='Dependencia')
    fecha_asignacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de asignación')

    class Meta:
        verbose_name = 'Equipo en dependencia'
        verbose_name_plural = 'Equipos en dependencias'
        unique_together = ['equipo', 'dependencia']

    def __str__(self):
        return f"{self.equipo.ninv} → {self.dependencia.nombre}"