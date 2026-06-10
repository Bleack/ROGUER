var tabla;
var urlBase;

 $(document).ready(function() {
    var page = document.getElementById('categoriaPage');
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

    $('#nuevaCategoria, #editarCategoria').on('hidden.bs.modal', function() {
        $(this).find('button').blur();
        $('[data-bs-target="#nuevaCategoria"]').focus();
    });

    $('#nuevaCategoria').on('hidden.bs.modal', function() {
        $("#registrar_categoria_form")[0].reset();
        $("#nombre_categoria_crear").attr('placeholder', 'Notebooks');
    });

    $('#editarCategoria').on('hidden.bs.modal', function() {
        $("#editar_categoria_form")[0].reset();
    });

    $('#nuevaCategoria').on('show.bs.modal', function() {
        $("#nombre_categoria_crear").val('').attr('placeholder', 'Notebooks');
    });

    $('#editarCategoria').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var id = button.data('id');
        var nombre = button.data('nombre_categoria');
        $("#edit_categoria_id").val(id);
        $("#nombre_categoria_actual").val(nombre);
        $("#nombre_categoria_editar").val(nombre);
        $("#nombre_categoria_editar").attr('placeholder', 'Ingrese nuevo nombre');
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

 $("#registrar_categoria_form").on("submit", function(e) {
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
            var c = data.data;
            tabla.row.add([
                c.id,
                c.nombre,
                '<span class="badge bg-success d-inline-flex align-items-center py-1 px-2 equipos-badge"><i class="fas fa-desktop me-1"></i> ' + c.total_equipos + ' Equipos</span>',
                '<a href="#" class="btn-editar" data-bs-toggle="modal" data-bs-target="#editarCategoria" data-id="' + c.id + '" data-nombre_categoria="' + c.nombre + '"><i class="far fa-edit"></i></a>'
            ]).draw(false);

            mostrarAlerta('success', data.mensaje, false);
            $("#nuevaCategoria").modal("hide");

            setTimeout(function() {
                $('[data-bs-target="#nuevaCategoria"]').focus();
            }, 300);
        } else {
            mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar la categoría', true);
        }
    })
    .catch(function(err) {
        mostrarAlerta('error', err.message || 'Ocurrió un error al procesar la solicitud', true);
    });
});

 $("#editar_categoria_form").on("submit", function(e) {
    e.preventDefault();
    var id = $("#edit_categoria_id").val();
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
            var c = data.data;
            var row = tabla.row($('#controls-table a.btn-editar[data-id="' + c.id + '"]').closest("tr"));
            var rowData = row.data();
            rowData[1] = c.nombre;
            rowData[2] = '<span class="badge bg-success d-inline-flex align-items-center py-1 px-2 equipos-badge"><i class="fas fa-desktop me-1"></i> ' + c.total_equipos + ' Equipos</span>';
            rowData[3] = '<a href="#" class="btn-editar" data-bs-toggle="modal" data-bs-target="#editarCategoria" data-id="' + c.id + '" data-nombre_categoria="' + c.nombre + '"><i class="far fa-edit"></i></a>';
            row.data(rowData).draw(false);

            mostrarAlerta('success', data.mensaje, false);
            $("#editarCategoria").modal("hide");

            setTimeout(function() {
                $('#controls-table a.btn-editar[data-id="' + c.id + '"]').focus();
            }, 300);
        } else {
            mostrarAlerta('error', data.mensaje_global || 'No se pudo actualizar la categoría', true);
        }
    })
    .catch(function(err) {
        mostrarAlerta('error', err.message || 'Ocurrió un error al procesar la solicitud', true);
    });
});