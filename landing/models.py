from django.db import models


class ContactoLanding(models.Model):
    ASUNTO_CHOICES = [
        ('demo', 'Solicitar Demo'),
        ('info', 'Solicitar Información'),
        ('soporte', 'Soporte Técnico'),
        ('otro', 'Otro'),
    ]

    nombre_completo = models.CharField(max_length=200, verbose_name='Nombre completo')
    email = models.EmailField(verbose_name='Email')
    empresa = models.CharField(max_length=200, verbose_name='Empresa', blank=True, default='')
    telefono = models.CharField(max_length=30, verbose_name='Teléfono', blank=True, default='')
    asunto = models.CharField(max_length=20, choices=ASUNTO_CHOICES, verbose_name='Asunto')
    mensaje = models.TextField(verbose_name='Mensaje')
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')

    class Meta:
        verbose_name = 'Contacto landing'
        verbose_name_plural = 'Contactos landing'
        ordering = ['-fecha_registro']

    def __str__(self):
        return f"{self.nombre_completo} - {self.asunto} - {self.fecha_registro.strftime('%d/%m/%Y')}"