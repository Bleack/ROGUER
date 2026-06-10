var tabla;
var urlBase;

 $(document).ready(function() {
    var page = document.getElementById('usuarioPage');
    if (!page) return;
    urlBase = page.dataset.urlBase;

    tabla = $('#controls-table').DataTable({
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
            loadingRecords: '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><div>Cargando...</div></div>',
            emptyTable: "No se encontraron registros",
            zeroRecords: "No se encontraron resultados"
        }
    });

    $('#crearusuario, #editarusuario').on('hidden.bs.modal', function() {
        $(this).find('button').blur();
        $('[data-bs-target="#crearusuario"]').focus();
    });

    $('#crearusuario').on('hidden.bs.modal', function() {
        $("#registrar_usuario_form")[0].reset();
        $("#nombre_usuario_crear").attr('placeholder', 'Jorge Hernandez F');
        $("#rut_usuario_crear").attr('placeholder', '11.111.111-1');
        $("#clave_usuario_crear").attr('placeholder', '**********');
    });

    $('#editarusuario').on('hidden.bs.modal', function() {
        $("#editar_usuario_form")[0].reset();
    });

    $('#crearusuario').on('show.bs.modal', function() {
        $("#nombre_usuario_crear").val('').attr('placeholder', 'Jorge Hernandez F');
        $("#rut_usuario_crear").val('').attr('placeholder', '11.111.111-1');
        $("#clave_usuario_crear").val('').attr('placeholder', '**********');
    });

    $('#editarusuario').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var nombre = button.data('nombre_actual');
        var rut = button.data('rut_actual');
        $("#usuario_id").val(id);
        $("#nombre_usuario_editar").val(nombre);
        $("#rut_usuario_editar").val(rut);
        $("#clave_usuario_editar").val('');
        $("#nombre_usuario_editar").attr('placeholder', 'Jorge Hernandez F');
        $("#rut_usuario_editar").attr('placeholder', '11.111.111-1');
        $("#clave_usuario_editar").attr('placeholder', 'Dejar en blanco para no cambiar');
    });
});

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

function pendientesBadge(cantidad) {
    if (cantidad >= 1) {
        return '<span class="badge bg-danger">' + cantidad + ' Pendientes</span>';
    }
    return '<span class="badge bg-success">' + cantidad + ' Pendientes</span>';
}

function filaUsuario(d) {
    return [
        d.id,
        d.nombre,
        d.rut,
        '<span class="badge bg-success">' + d.total_prestamos + ' Equipos</span>',
        pendientesBadge(d.entregas_pendientes),
        '<a href="#" class="btn-editar" data-bs-toggle="modal" data-bs-target="#editarusuario" data-id="' + d.id + '" data-nombre_actual="' + d.nombre + '" data-rut_actual="' + d.rut + '"><i class="far fa-edit"></i></a>'
    ];
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

 $("#registrar_usuario_form").on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData(this);

    fetch(urlBase + 'crear/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(function(response) {
        var contentType = response.headers.get('content-type') || '';
        if (contentType.indexOf('application/json') === -1) {
            throw new Error('Error del servidor (' + response.status + ')');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.ok && data.data) {
            tabla.row.add(filaUsuario(data.data)).draw(false);
            mostrarAlerta('success', data.mensaje, false);
            $("#crearusuario").modal("hide");
            setTimeout(function() {
                $('[data-bs-target="#crearusuario"]').focus();
            }, 300);
        } else {
            mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar el usuario', true);
        }
    })
    .catch(function(err) {
        mostrarAlerta('error', err.message || 'Ocurrió un error al procesar la solicitud', true);
    });
});

 $("#editar_usuario_form").on("submit", function(e) {
    e.preventDefault();
    var id = $("#usuario_id").val();
    var formData = new FormData(this);

    fetch(urlBase + id + '/editar/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(function(response) {
        var contentType = response.headers.get('content-type') || '';
        if (contentType.indexOf('application/json') === -1) {
            throw new Error('Error del servidor (' + response.status + ')');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.ok && data.data) {
            var row = tabla.row($('#controls-table a.btn-editar[data-id="' + data.data.id + '"]').closest("tr"));
            row.data(filaUsuario(data.data)).draw(false);
            mostrarAlerta('success', data.mensaje, false);
            $("#editarusuario").modal("hide");
            setTimeout(function() {
                $('#controls-table a.btn-editar[data-id="' + data.data.id + '"]').focus();
            }, 300);
        } else {
            mostrarAlerta('error', data.mensaje_global || 'No se pudo actualizar el usuario', true);
        }
    })
    .catch(function(err) {
        mostrarAlerta('error', err.message || 'Ocurrió un error al procesar la solicitud', true);
    });
});