var urlBase;
var tablaEquipos = null;
var categoriaActualId = null;

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

function actualizarMensajeCategoria(categoriaId, categoriaNombre) {
    if (categoriaId && categoriaNombre) {
        $('#welcome-message').hide();
        $('#category-message').show();
        $('#category-name').text(categoriaNombre);
        $('#category-selector').val(categoriaId);
    } else {
        $('#welcome-message').show();
        $('#category-message').hide();
        $('#category-selector').val('');
    }
}

function crearTablaEquipos(categoriaId) {
    if ($.fn.DataTable.isDataTable('#controls-table')) {
        $('#controls-table').DataTable().destroy();
    }

    tablaEquipos = $('#controls-table').DataTable({
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
            loadingRecords: '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><div>Cargando...</div></div>',
            emptyTable: "No se encontraron registros",
            zeroRecords: "No se encontraron resultados"
        },
        rowCallback: function(row, data) {
            $(row).attr('data-id', data.id);
        },
        ajax: {
            url: urlBase + 'tabla/',
            type: 'POST',
            data: function(d) {
                d.categoria = categoriaId;
                d.csrfmiddlewaretoken = getCSRFToken();
            },
            dataSrc: function(json) {
                if (json.ok) return json.equipos;
                return [];
            }
        },
        columns: [
            { data: 'id' },
            { data: 'ninv' },
            { data: 'nserie' },
            { data: 'marca' },
            { data: 'modelo' },
            { data: 'fondos' },
            { data: 'observaciones' },
            {
                data: 'id',
                orderable: false,
                render: function(data, type, row) {
                    return '<a href="#" class="btn-gestionar" data-bs-toggle="modal" data-bs-target="#gestionarEquipo" data-id="' + data + '"><i class="far fa-edit action-icon"></i></a>';
                }
            },
            {
                data: 'id',
                orderable: false,
                render: function(data, type, row) {
                    return '<a href="#" class="btn-baja" data-bs-toggle="modal" data-bs-target="#darBajaEquipo" data-id="' + data + '" data-marca="' + row.marca + '" data-modelo="' + row.modelo + '" data-nserie="' + row.nserie + '"><i class="fas fa-ban action-icon"></i></a>';
                }
            }
        ]
    });

    return tablaEquipos;
}

function mostrarVistaTabla(categoriaId, categoriaNombre) {
    categoriaActualId = categoriaId;
    actualizarMensajeCategoria(categoriaId, categoriaNombre);
    $('.dependencias-container').hide();
    $('.box-table').show();
    crearTablaEquipos(categoriaId);
}

 $(document).ready(function() {
    var page = document.getElementById('equipoPage');
    if (!page) return;
    urlBase = page.dataset.urlBase;

    $('.dependencias-box').on('click', function(e) {
        e.preventDefault();
        var categoriaId = $(this).data('categoria');
        var categoriaNombre = $(this).data('nombre');
        mostrarVistaTabla(categoriaId, categoriaNombre);
    });

    $('#category-selector').on('change', function() {
        var selectedId = $(this).val();
        var selectedNombre = $(this).find('option:selected').text();
        if (!selectedId) return;
        mostrarVistaTabla(selectedId, selectedNombre);
    });

    $('#registrar-equipo-btn').on('click', function() {
        var categoriaId = $('#category-selector').val();
        if (!categoriaId) {
            mostrarAlerta('warning', 'Debe seleccionar una categoría primero', true);
            return;
        }
        $('#reg_id_categoria').val(categoriaId);
        new bootstrap.Modal(document.getElementById('registrarEquipo')).show();
    });

        $('#gestionarEquipo').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var idEquipo = button.data('id');

        $('#editar_equipo_form')[0].reset();
        $('#edit_equipo_id').val(idEquipo);
        $('#edit_marca').val('').attr('readonly', true);
        $('#edit_modelo').val('').attr('readonly', true);
        $('#edit_nserie').val('');
        $('#edit_ninv').val('');
        $('#edit_fondos').val('');
        $('#edit_nombre_adm').val('');
        $('#edit_observaciones').val('');

        fetch(urlBase + 'obtener/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'id_equipo=' + encodeURIComponent(idEquipo)
        })
        .then(function(response) {
            var ct = response.headers.get('content-type') || '';
            if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
            return response.json();
        })
        .then(function(data) {
            if (!data.ok) return;
            var eq = data.equipo;
            $('#edit_marca').val(eq.marca || '').attr('readonly', false);
            $('#edit_modelo').val(eq.modelo || '').attr('readonly', false);
            $('#edit_nserie').val(eq.nserie || '');
            $('#edit_ninv').val(eq.ninv || '');
            $('#edit_fondos').val(eq.fondos || '');
            $('#edit_nombre_adm').val(eq.nombre_adm || '');
            $('#edit_observaciones').val(eq.observaciones || '');
        })
        .catch(function(err) {
            bootstrap.Modal.getInstance(document.getElementById('gestionarEquipo')).hide();
            mostrarAlerta('error', 'Error al cargar datos del equipo', true);
        });
    });

    $(document).on('submit', '#editar_equipo_form', function(e) {
        e.preventDefault();
        var idEquipo = $('#edit_equipo_id').val();
        var marca = $('#edit_marca').val().trim();
        var modelo = $('#edit_modelo').val().trim();
        if (!marca || !modelo) {
            mostrarAlerta('warning', 'Marca y Modelo son obligatorios', true);
            return;
        }
        var formData = new FormData(this);
        formData.set('marca', marca);
        formData.set('modelo', modelo);
        formData.set('observaciones', $('#edit_observaciones').val());

        fetch(urlBase + idEquipo + '/editar/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        })
        .then(function(response) {
            var ct = response.headers.get('content-type') || '';
            if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
            return response.json();
        })
        .then(function(data) {
            if (data.ok) {
                bootstrap.Modal.getInstance(document.getElementById('gestionarEquipo')).hide();
                if (tablaEquipos) tablaEquipos.ajax.reload();
                mostrarAlerta('success', data.mensaje, false);
            } else {
                mostrarAlerta('error', data.mensaje_global || 'No se pudo actualizar', true);
            }
        })
        .catch(function(err) {
            mostrarAlerta('error', err.message || 'Error de conexión', true);
        });
    });

    $('#gestionarEquipo').on('hidden.bs.modal', function() {
        $('#editar_equipo_form')[0].reset();
        $('#edit_marca').attr('readonly', false);
        $('#edit_modelo').attr('readonly', false);
    });

    $('#darBajaEquipo').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        $('#id_equipo_a_baja').val(button.data('id'));
        $('#marca_baja_display').text(button.data('marca'));
        $('#modelo_baja_display').text(button.data('modelo'));
        $('#nserie_baja_display').text(button.data('nserie'));
    });

    $('#confirmar_baja_equipo_btn').on('click', function() {
        var modal = bootstrap.Modal.getInstance(document.getElementById('darBajaEquipo'));
        var idEquipo = $('#id_equipo_a_baja').val();

        var formData = new FormData();
        formData.append('id_equipo', idEquipo);

        fetch(urlBase + 'dar-baja/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData
        })
        .then(function(response) {
            var ct = response.headers.get('content-type') || '';
            if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
            return response.json();
        })
        .then(function(data) {
            if (data.ok) {
                modal.hide();
                if (tablaEquipos) tablaEquipos.ajax.reload();
                mostrarAlerta('success', data.mensaje, false);
            } else {
                mostrarAlerta('error', data.mensaje, true);
            }
        })
        .catch(function(err) {
            mostrarAlerta('error', err.message || 'Error de conexión', true);
        });
    });

    $('#registrar_equipo_form').on('submit', function(e) {
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
            var ct = response.headers.get('content-type') || '';
            if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
            return response.json();
        })
        .then(function(data) {
            if (data.ok) {
                bootstrap.Modal.getInstance(document.getElementById('registrarEquipo')).hide();
                $('#registrar_equipo_form')[0].reset();
                if (tablaEquipos) tablaEquipos.ajax.reload();
                mostrarAlerta('success', data.mensaje, false);
            } else {
                mostrarAlerta('error', data.mensaje_global || 'No se pudo registrar', true);
            }
        })
        .catch(function(err) {
            mostrarAlerta('error', err.message || 'Error de conexión', true);
        });
    });

    $('#registrarEquipo').on('hidden.bs.modal', function() {
        $("#registrar_equipo_form")[0].reset();
    });
});