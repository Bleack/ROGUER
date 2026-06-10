document.addEventListener('DOMContentLoaded', function() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            const navbarCollapse = document.getElementById('navbarLanding');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.landing-navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
        } else {
            navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.3)';
        }
    });

    const form = document.getElementById('contactForm');
    if (!form) return;

    const btnSubmit = form.querySelector('.btn-submit');
    const textoOriginalBtn = btnSubmit.innerHTML;

    const campos = {
        nombre_completo: form.querySelector('[name="nombre_completo"]'),
        email: form.querySelector('[name="email"]'),
        empresa: form.querySelector('[name="empresa"]'),
        telefono: form.querySelector('[name="telefono"]'),
        asunto: form.querySelector('[name="asunto"]'),
        mensaje: form.querySelector('[name="mensaje"]'),
    };

    function getCSRFToken() {
        const cookie = document.cookie.split(';');
        for (let c of cookie) {
            c = c.trim();
            if (c.startsWith('csrftoken=')) {
                return decodeURIComponent(c.substring('csrftoken='.length));
            }
        }
        return '';
    }

    function limpiarErrorCampo(campo) {
        if (!campo) return;
        campo.classList.remove('is-invalid');
        const feedback = campo.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.remove();
    }

    function marcarErrorCampo(campo, mensaje) {
        if (!campo) return;
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        const existente = campo.parentElement.querySelector('.invalid-feedback');
        if (existente) existente.remove();
        const div = document.createElement('div');
        div.className = 'invalid-feedback';
        div.textContent = mensaje;
        campo.parentElement.appendChild(div);
    }

    function marcarValido(campo) {
        if (!campo) return;
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
        const feedback = campo.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.remove();
    }

    function limpiarTodosLosErrores() {
        Object.values(campos).forEach(function (campo) {
            if (campo) {
                campo.classList.remove('is-invalid', 'is-valid');
                const feedback = campo.parentElement.querySelector('.invalid-feedback');
                if (feedback) feedback.remove();
            }
        });
    }

    function setBtnCargando(cargando) {
        if (cargando) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
            btnSubmit.style.opacity = '0.7';
            btnSubmit.style.pointerEvents = 'none';
        } else {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginalBtn;
            btnSubmit.style.opacity = '1';
            btnSubmit.style.pointerEvents = 'auto';
        }
    }

    function resetearFormulario() {
        form.reset();
        limpiarTodosLosErrores();
    }

    Object.entries(campos).forEach(function ([key, campo]) {
        if (!campo) return;
        campo.addEventListener('blur', function () {
            limpiarErrorCampo(campo);
            const val = campo.value.trim();
            if (key === 'nombre_completo') {
                if (!val) marcarErrorCampo(campo, 'El nombre es obligatorio.');
                else if (val.length < 3) marcarErrorCampo(campo, 'Mínimo 3 caracteres.');
                else marcarValido(campo);
            }
            if (key === 'email') {
                if (!val) marcarErrorCampo(campo, 'El email es obligatorio.');
                else if (!val.includes('@') || !val.split('@')[1]?.includes('.'))
                    marcarErrorCampo(campo, 'Ingresa un email válido.');
                else marcarValido(campo);
            }
            if (key === 'asunto') {
                if (!val) marcarErrorCampo(campo, 'Selecciona un asunto.');
                else marcarValido(campo);
            }
            if (key === 'mensaje') {
                if (!val) marcarErrorCampo(campo, 'El mensaje es obligatorio.');
                else if (val.length < 10) marcarErrorCampo(campo, 'Mínimo 10 caracteres.');
                else marcarValido(campo);
            }
        });
        campo.addEventListener('input', function () {
            if (campo.classList.contains('is-invalid')) {
                limpiarErrorCampo(campo);
            }
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        limpiarTodosLosErrores();
        const formData = new FormData(form);
        setBtnCargando(true);

        fetch('/contacto-landing/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
        })
        .then(function (response) {
            var contentType = response.headers.get('content-type') || '';
            if (contentType.indexOf('application/json') === -1) {
                return response.text().then(function () {
                    throw new Error('Error del servidor (' + response.status + '). Revisa la consola de Django.');
                });
            }
            return response.json().then(function (data) {
                data._status = response.status;
                return data;
            });
        })
        .then(function (data) {
            setBtnCargando(false);
            if (data.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje enviado!',
                    text: data.mensaje,
                    confirmButtonColor: '#2ecc71',
                    confirmButtonText: 'Entendido',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                resetearFormulario();
            } else {
                if (data.errores) {
                    Object.entries(data.errores).forEach(function ([campo, mensaje]) {
                        marcarErrorCampo(campos[campo], mensaje);
                    });
                    var primerError = form.querySelector('.is-invalid');
                    if (primerError) {
                        primerError.focus();
                        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el formulario',
                    text: data.mensaje_global || 'Revisa los campos marcados en rojo.',
                    confirmButtonColor: '#e74c3c',
                    confirmButtonText: 'Corregir',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
            }
        })
        .catch(function (err) {
            setBtnCargando(false);
            console.error('Error al enviar formulario:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: err.message || 'No se pudo conectar con el servidor. Intenta nuevamente.',
                confirmButtonColor: '#e74c3c',
                confirmButtonText: 'Reintentar',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        });
    });

});