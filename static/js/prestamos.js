var urlBase;
var tablaPrestamos;

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

 $(document).ready(function() {
    var page = document.getElementById('prestamosPage');
    if (!page) return;
    urlBase = page.dataset.urlBase;

    tablaPrestamos = $('#controls-table').DataTable({
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
            url: urlBase + 'get-tabla/',
            type: 'POST',
            data: function(d) {
                d.csrfmiddlewaretoken = getCSRFToken();
            },
            dataSrc: function(json) {
                if (json.ok) return json.prestamos;
                return [];
            }
        },
        columns: [
            { data: 'id' },
            { data: 'categoria' },
            { data: 'marca' },
            { data: 'nombre_usuario' },
            {
                data: 'estado',
                render: function(data) {
                    if (data === 'Pendiente') {
                        return '<span class="badge bg-danger">Pendiente</span>';
                    }
                    return '<span class="badge bg-success">Devuelto</span>';
                }
            },
            { data: 'observacion' },
            {
                data: 'id',
                orderable: false,
                render: function(data, type, row) {
                    if (row.estado === 'Pendiente') {
                        return '<a href="#" class="btn-devolver" data-id="' + data + '" title="Devolver equipo"><i class="fas fa-undo"></i></a>';
                    }
                    return '<span class="badge bg-success">Devuelto</span>';
                }
            }
        ],
        order: []
    });

    $('#modalPrestamo').on('show.bs.modal', function() {
        var today = new Date().toISOString().split('T')[0];
        $('#f_prestamo').val(today);
    });

    $('#modalPrestamo').on('hidden.bs.modal', function() {
        $('#formPrestamo')[0].reset();
        $('#id_equipo').empty().append('<option value="">Seleccione un equipo</option>').prop('disabled', true);
    });

    $('#id_categoria').change(function() {
        var idCategoria = $(this).val();
        if (idCategoria) {
            $.ajax({
                url: urlBase + 'get-equipos/',
                method: 'POST',
                data: {
                    id_categoria: idCategoria,
                    csrfmiddlewaretoken: getCSRFToken()
                },
                dataType: 'json',
                success: function(response) {
                    if (response.ok) {
                        $('#id_equipo').empty().append('<option value="">Seleccione un equipo</option>').prop('disabled', false);
                        $.each(response.equipos, function(index, equipo) {
                            $('#id_equipo').append('<option value="' + equipo.id + '">' + equipo.ninv + ' - ' + equipo.marca + ' ' + equipo.modelo + '</option>');
                        });
                    }
                }
            });
        } else {
            $('#id_equipo').empty().append('<option value="">Seleccione un equipo</option>').prop('disabled', true);
        }
    });

    var enviandoPrestamo = false;

    $('#btnGuardarPrestamo').click(function() {
        if (!$('#formPrestamo')[0].checkValidity()) {
            $('#formPrestamo')[0].reportValidity();
            return;
        }
        if (enviandoPrestamo) return;
        enviandoPrestamo = true;
        $('#btnGuardarPrestamo').prop('disabled', true);

        var formData = new FormData($('#formPrestamo')[0]);

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
                bootstrap.Modal.getInstance(document.getElementById('modalPrestamo')).hide();
                tablaPrestamos.ajax.reload();
                mostrarAlerta('success', data.mensaje, false);
            } else {
                mostrarAlerta('error', data.mensaje, true);
            }
        })
        .catch(function(err) {
            mostrarAlerta('error', err.message || 'Error de conexión', true);
        })
        .finally(function() {
            $('#btnGuardarPrestamo').prop('disabled', false);
            enviandoPrestamo = false;
        });
    });

    $(document).on('click', '.btn-devolver', function(e) {
        e.preventDefault();
        var idPrestamo = $(this).data('id');

        Swal.fire({
            title: '¿Seguro de devolver el equipo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, devolver',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
        }).then(function(result) {
            if (result.isConfirmed) {
                var formData = new FormData();
                formData.append('id_prestamo', idPrestamo);

                fetch(urlBase + 'devolver/', {
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
                        tablaPrestamos.ajax.reload();
                        mostrarAlerta('success', data.mensaje, false);
                    } else {
                        mostrarAlerta('error', data.mensaje, true);
                    }
                })
                .catch(function(err) {
                    mostrarAlerta('error', err.message || 'Error de conexión', true);
                });
            }
        });
    });
});