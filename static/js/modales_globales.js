function mostrarAlerta(icono, texto, esError) {
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: icono,
        text: texto,
        showConfirmButton: false,
        showCloseButton: esError,
        timer: esError ? undefined : 2000,
        timerProgressBar: !esError
    });
}

function getCSRFToken() {
    var cookie = document.cookie.split(';');
    for (var i = 0; i < cookie.length; i++) {
        var c = cookie[i].trim();
        if (c.indexOf('csrftoken=') === 0) {
            return decodeURIComponent(c.substring('csrftoken='.length));
        }
    }
    return '';
}

function setBtnCargando(btn, cargando, textoOriginal) {
    if (cargando) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Registrando...';
    } else {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

function fetchPost(url, formData) {
    return fetch(url, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken(), 'X-Requested-With': 'XMLHttpRequest' },
        body: formData
    }).then(function(response) {
        var ct = response.headers.get('content-type') || '';
        if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor (' + response.status + ')');
        return response.json();
    });
}

document.addEventListener('DOMContentLoaded', function() {

    var today = new Date().toISOString().split('T')[0];
    document.getElementById('rap_pr_fecha').value = today;

    function resetSelect(selectEl, placeholder) {
        selectEl.empty().append('<option value="">' + placeholder + '</option>').prop('disabled', true);
    }

    document.getElementById('modalRapidoCategoria').addEventListener('hidden.bs.modal', function() {
        document.getElementById('formRapidoCategoria').reset();
    });

    document.getElementById('formRapidoCategoria').addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = document.getElementById('btnGuardarRapidoCategoria');
        var textoOriginal = btn.innerHTML;
        setBtnCargando(btn, true, textoOriginal);

        fetchPost('/categorias/crear/', new FormData(this))
            .then(function(data) {
                setBtnCargando(btn, false, textoOriginal);
                if (data.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalRapidoCategoria')).hide();
                    mostrarAlerta('success', data.mensaje, false);
                    document.getElementById('formRapidoCategoria').reset();
                } else {
                    mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar', true);
                }
            })
            .catch(function(err) {
                setBtnCargando(btn, false, textoOriginal);
                mostrarAlerta('error', err.message, true);
            });
    });

    document.getElementById('modalRapidoUsuario').addEventListener('hidden.bs.modal', function() {
        document.getElementById('formRapidoUsuario').reset();
    });

    document.getElementById('formRapidoUsuario').addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = document.getElementById('btnGuardarRapidoUsuario');
        var textoOriginal = btn.innerHTML;
        setBtnCargando(btn, true, textoOriginal);

        fetchPost('/usuarios/crear/', new FormData(this))
            .then(function(data) {
                setBtnCargando(btn, false, textoOriginal);
                if (data.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalRapidoUsuario')).hide();
                    mostrarAlerta('success', data.mensaje, false);
                    document.getElementById('formRapidoUsuario').reset();
                } else {
                    mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar', true);
                }
            })
            .catch(function(err) {
                setBtnCargando(btn, false, textoOriginal);
                mostrarAlerta('error', err.message, true);
            });
    });

    document.getElementById('modalRapidoEquipo').addEventListener('show.bs.modal', function() {
        var selCat = document.getElementById('rap_eq_categoria');
        if (selCat.children.length <= 1) {
            fetch('/categorias/lista-json/')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.results) {
                        selCat.empty().append('<option value="">Seleccione una categoría</option>');
                        data.results.forEach(function(c) {
                            selCat.append('<option value="' + c.id + '">' + c.nombre + '</option>');
                        });
                    }
                });
        }
    });

    document.getElementById('modalRapidoEquipo').addEventListener('hidden.bs.modal', function() {
        document.getElementById('formRapidoEquipo').reset();
        resetSelect($('#rap_eq_equipo')[0], 'Primero seleccione categoría');
    });

    document.getElementById('rap_eq_categoria').addEventListener('change', function() {
        var idCategoria = $(this).val();
        var selEq = $('#rap_eq_equipo');
        if (!idCategoria) {
            resetSelect(selEq[0], 'Primero seleccione categoría');
            return;
        }
        $.ajax({
            url: '/equipos/tabla/',
            method: 'POST',
            data: { categoria: idCategoria, csrfmiddlewaretoken: getCSRFToken() },
            dataType: 'json',
            success: function(response) {
                if (response.ok) {
                    selEq.empty().append('<option value="">Seleccione un equipo</option>').prop('disabled', false);
                    response.equipos.forEach(function(eq) {
                        selEq.append('<option value="' + eq.id + '">' + eq.ninv + ' - ' + eq.marca + ' ' + eq.modelo + '</option>');
                    });
                }
            }
        });
    });

    document.getElementById('formRapidoEquipo').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('rap_eq_id_categoria').value = document.getElementById('rap_eq_categoria').value;
        var btn = document.getElementById('btnGuardarRapidoEquipo');
        var textoOriginal = btn.innerHTML;
        setBtnCargando(btn, true, textoOriginal);

        fetchPost('/equipos/crear/', new FormData(this))
            .then(function(data) {
                setBtnCargando(btn, false, textoOriginal);
                if (data.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalRapidoEquipo')).hide();
                    mostrarAlerta('success', data.mensaje, false);
                    document.getElementById('formRapidoEquipo').reset();
                    resetSelect($('#rap_eq_equipo')[0], 'Primero seleccione categoría');
                } else {
                    mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar', true);
                }
            })
            .catch(function(err) {
                setBtnCargando(btn, false, textoOriginal);
                mostrarAlerta('error', err.message, true);
            });
    });

    document.getElementById('modalRapidoPrestamo').addEventListener('show.bs.modal', function() {
        var selCat = document.getElementById('rap_pr_categoria');
        var selUsu = document.getElementById('rap_pr_usuario');

        if (selCat.children.length <= 1) {
            fetch('/categorias/lista-json/')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.results) {
                        selCat.empty().append('<option value="">Seleccione una categoría</option>');
                        data.results.forEach(function(c) {
                            selCat.append('<option value="' + c.id + '">' + c.nombre + '</option>');
                        });
                    }
                });
        }

        if (selUsu.children.length <= 1) {
            fetch('/usuarios/lista-json/')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.results) {
                        selUsu.empty().append('<option value="">Seleccione un usuario</option>');
                        data.results.forEach(function(u) {
                            selUsu.append('<option value="' + u.id + '">' + u.nombre + ' - ' + u.rut + '</option>');
                        });
                    }
                });
        }
    });

    document.getElementById('modalRapidoPrestamo').addEventListener('hidden.bs.modal', function() {
        document.getElementById('formRapidoprestamo').reset();
        resetSelect($('#rap_pr_equipo')[0], 'Primero seleccione categoría');
        document.getElementById('rap_pr_fecha').value = today;
    });

    document.getElementById('rap_pr_categoria').addEventListener('change', function() {
        var idCategoria = $(this).val();
        var selEq = $('#rap_pr_equipo');
        if (!idCategoria) {
            resetSelect(selEq[0], 'Primero seleccione categoría');
            return;
        }
        $.ajax({
            url: '/prestamos/get-equipos/',
            method: 'POST',
            data: { id_categoria: idCategoria, csrfmiddlewaretoken: getCSRFToken() },
            dataType: 'json',
            success: function(response) {
                if (response.ok) {
                    selEq.empty().append('<option value="">Seleccione un equipo</option>').prop('disabled', false);
                    response.equipos.forEach(function(eq) {
                        selEq.append('<option value="' + eq.id + '">' + eq.ninv + ' - ' + eq.marca + ' ' + eq.modelo + '</option>');
                    });
                }
            }
        });
    });

    document.getElementById('formRapidoprestamo').addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = document.getElementById('btnGuardarRapidoPrestamo');
        var textoOriginal = btn.innerHTML;
        setBtnCargando(btn, true, textoOriginal);

        fetchPost('/prestamos/crear/', new FormData(this))
            .then(function(data) {
                setBtnCargando(btn, false, textoOriginal);
                if (data.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalRapidoPrestamo')).hide();
                    mostrarAlerta('success', data.mensaje, false);
                    document.getElementById('formRapidoprestamo').reset();
                    resetSelect($('#rap_pr_equipo')[0], 'Primero seleccione categoría');
                    document.getElementById('rap_pr_fecha').value = today;
                } else {
                    mostrarAlerta('error', data.mensaje, true);
                }
            })
            .catch(function(err) {
                setBtnCargando(btn, false, textoOriginal);
                mostrarAlerta('error', err.message, true);
            });
    });
});