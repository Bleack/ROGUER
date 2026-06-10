var urlBase;
var tablaActual = null;

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

function actualizarMensajePiso(piso) {
    var nombres = {1: "Piso 1", 2: "Piso 2", 3: "Piso 3", 'todas': "Todas las Dependencias"};
    if (piso && nombres[piso]) {
        $('#welcome-message').hide();
        $('#floor-message').show();
        $('#floor-name').text(nombres[piso]);
    } else {
        $('#welcome-message').show();
        $('#floor-message').hide();
    }
}

function crearTabla(piso) {
    if ($.fn.DataTable.isDataTable('#controls-table')) {
        $('#controls-table').DataTable().destroy();
    }

    tablaActual = $('#controls-table').DataTable({
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
            loadingRecords: '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><div>Cargando...</div></div>',
            emptyTable: "No se encontraron registros",
            zeroRecords: "No se encontraron resultados"
        },
        rowCallback: function(row, data) { $(row).attr('data-id', data.id); },
        ajax: {
            url: urlBase + 'get-tabla/',
            type: 'POST',
            data: function(d) {
                d.piso = piso;
                d.csrfmiddlewaretoken = getCSRFToken();
            },
            dataSrc: function(json) {
                if (json.ok) return json.dependencias;
                return [];
            }
        },
        columns: [
            { data: 'id' },
            { data: 'nombre' },
            { data: 'piso' },
            {
                data: 'total_equipos',
                render: function(data) {
                    return '<span class="badge bg-success d-inline-flex align-items-center py-1 px-2 equipos-badge"><i class="fas fa-desktop me-1"></i> ' + data + ' Equipos</span>';
                }
            },
            {
                data: 'id',
                orderable: false,
                render: function(data, type, row) {
                    return '<a href="#" class="btn-gestionar" data-bs-toggle="modal" data-bs-target="#gestionardependencia" data-id="' + data + '" data-nombre="' + row.nombre + '"><i class="far fa-edit action-icon"></i></a>';
                }
            }
        ]
    });
}

function actualizarFilaDataTable(id_dep) {
    fetch(urlBase + 'get-equipos/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken(), 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_dependencia=' + encodeURIComponent(id_dep)
    })
    .then(function(r) { return r.json(); })
    .then(function(resp) {
        if (resp.ok) {
            var total = resp.equipos_asignados.length;
            var fila = tablaActual.rows().nodes().to$().filter('[data-id="' + id_dep + '"]');
            if (fila.length) {
                fila.find('.equipos-badge').html('<i class="fas fa-desktop me-1"></i> ' + total + ' Equipos');
            }
        }
    });
}

function cargarDatosDependencia(id_dep, modal) {
    fetch(urlBase + 'get-equipos/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCSRFToken(), 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_dependencia=' + encodeURIComponent(id_dep)
    })
    .then(function(r) {
        var ct = r.headers.get('content-type') || '';
        if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
        return r.json();
    })
    .then(function(response) {
        if (!response.ok) {
            modal.find('#equipos_list, #equipos_libres_container').html('<p>Error al cargar equipos.</p>');
            return;
        }

        var htmlEquipos = '';
        if (response.equipos_asignados && response.equipos_asignados.length > 0) {
            for (var i = 0; i < response.equipos_asignados.length; i++) {
                var eq = response.equipos_asignados[i];
                htmlEquipos += '<div class="list-group-item d-flex justify-content-between align-items-center mb-2">' +
                    '<div>' +
                        '<h6 style="margin-bottom:4px;"><i class="fas fa-desktop"></i> ' + eq.marca + ' ' + eq.modelo + '</h6>' +
                        '<small>' + eq.categoria + ' • N° Serie: ' + eq.nserie + ' • Inv: ' + eq.ninv + '</small>' +
                    '</div>' +
                    '<button class="btn btn-sm btn-outline-danger btn-eliminar-equipo" data-id-equipo="' + eq.id + '" data-id-registro="' + eq.id_registro + '">' +
                        '<i class="fas fa-times"></i>' +
                    '</button>' +
                '</div>';
            }
        } else {
            htmlEquipos = '<p>No hay equipos asignados.</p>';
        }
        modal.find('#equipos_list').html(htmlEquipos);

        var opcionesCat = '<option value="">Seleccione categoría</option>';
        if (response.categorias) {
            for (var c = 0; c < response.categorias.length; c++) {
                var cat = response.categorias[c];
                opcionesCat += '<option value="' + cat.id + '">' + cat.nombre + '</option>';
            }
        }

        var opcionesEq = '<option value="">Seleccione equipo</option>';
        if (response.equipos_libres) {
            for (var e = 0; e < response.equipos_libres.length; e++) {
                var eqL = response.equipos_libres[e];
                opcionesEq += '<option value="' + eqL.id + '" data-categoria="' + eqL.id_categoria + '">' + eqL.marca + ' ' + eqL.modelo + ' • Inv: ' + eqL.ninv + '</option>';
            }
        }

        var htmlLibres = '<label for="selectCategoria" class="form-label">Categoría:</label>' +
            '<select id="selectCategoria" class="form-select mb-2">' + opcionesCat + '</select>' +
            '<hr>' +
            '<label for="selectEquipos" class="form-label">Equipo:</label>' +
            '<select id="selectEquipos" class="form-select mb-2">' + opcionesEq + '</select>' +
            '<button class="btn btn-success w-100" id="btnAsignarEquipo"><i class="fas fa-plus me-1"></i>Asignar equipo</button>';

        modal.find('#equipos_libres_container').html(htmlLibres);

        $('#selectCategoria').off('change').on('change', function() {
            var catId = $(this).val();
            $('#selectEquipos option').each(function() {
                var eqCat = $(this).data('categoria');
                $(this).toggle($(this).val() === "" || eqCat == catId);
            });
            $('#selectEquipos').val('');
        });

        $('#btnAsignarEquipo').off('click').on('click', function() {
            var idEquipo = $('#selectEquipos').val();
            if (!idEquipo) {
                mostrarAlerta('warning', 'Debe seleccionar un equipo', true);
                return;
            }
            var formData = new FormData();
            formData.append('action', 'asignar');
            formData.append('id_dependencia', id_dep);
            formData.append('id_equipo', idEquipo);

            fetch(urlBase + 'gestionar-equipos/', {
                method: 'POST',
                headers: { 'X-CSRFToken': getCSRFToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: formData
            })
            .then(function(r) {
                var ct = r.headers.get('content-type') || '';
                if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
                return r.json();
            })
            .then(function(resp) {
                if (resp.ok) {
                    cargarDatosDependencia(id_dep, modal);
                    actualizarFilaDataTable(id_dep);
                    mostrarAlerta('success', 'Equipo asignado', false);
                } else {
                    mostrarAlerta('error', resp.mensaje, true);
                }
            })
            .catch(function(err) { mostrarAlerta('error', err.message || 'Error de conexión', true); });
        });

        $(document).off('click', '.btn-eliminar-equipo').on('click', '.btn-eliminar-equipo', function() {
            var idEquipo = $(this).data('id-equipo');
            if (!idEquipo) return;

            Swal.fire({
                title: '¿Eliminar equipo de la dependencia?',
                html: 'Podrás volver a asignarlo después.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
            }).then(function(result) {
                if (result.isConfirmed) {
                    var formData = new FormData();
                    formData.append('action', 'eliminar');
                    formData.append('id_dependencia', id_dep);
                    formData.append('id_equipo', idEquipo);

                    fetch(urlBase + 'gestionar-equipos/', {
                        method: 'POST',
                        headers: { 'X-CSRFToken': getCSRFToken(), 'X-Requested-With': 'XMLHttpRequest' },
                        body: formData
                    })
                    .then(function(r) {
                        var ct = r.headers.get('content-type') || '';
                        if (ct.indexOf('application/json') === -1) throw new Error('Error del servidor');
                        return r.json();
                    })
                    .then(function(resp) {
                        if (resp.ok) {
                            cargarDatosDependencia(id_dep, modal);
                            actualizarFilaDataTable(id_dep);
                            mostrarAlerta('success', 'Eliminado', false);
                        } else {
                            mostrarAlerta('error', resp.mensaje, true);
                        }
                    })
                    .catch(function(err) { mostrarAlerta('error', err.message || 'Error de conexión', true); });
                }
            });
        });
    })
    .catch(function(err) {
        modal.find('#equipos_list, #equipos_libres_container').html('<p>Error de conexión.</p>');
    });
}

function mostrarVistaTabla(piso) {
    actualizarMensajePiso(piso);
    $('.dependencias-container').hide();
    $('.box-table').show();
    crearTabla(piso);
}

 $(document).ready(function() {
    var page = document.getElementById('dependenciasPage');
    if (!page) return;
    urlBase = page.dataset.urlBase;

    $('.dependencias-box').on('click', function(e) {
        e.preventDefault();
        var piso = $(this).data('piso');
        mostrarVistaTabla(piso);
    });

    $('#floor-selector').on('change', function() {
        var selected = $(this).val();
        if (!selected) return;
        mostrarVistaTabla(selected);
    });

    $('#gestionardependencia').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var id_dep = button.data('id');
        var nombre_dep = button.data('nombre');
        var modal = $(this);

        modal.data('id_dependencia', id_dep);
        modal.find('#dep_nombre').text(nombre_dep);
        modal.find('#equipos_list, #equipos_libres_container').html(
            '<div class="d-flex justify-content-center align-items-center" style="height:150px;">' +
            '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>'
        );
        cargarDatosDependencia(id_dep, modal);
    });
});