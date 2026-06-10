var urlBase;
var tabla;

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
    var page = document.getElementById('equiposBajaPage');
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
        },
        rowCallback: function(row, data) {
            $(row).attr('data-id', data.id);
        }
    });

    $('#reactivarEquipo').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        $('#id_equipo_a_reactivar').val(button.data('id'));
        $('#ninv_reactivar_display').text(button.data('ninv'));
        $('#categoria_reactivar_display').text(button.data('categoria'));
        $('#marca_reactivar_display').text(button.data('marca'));
        $('#modelo_reactivar_display').text(button.data('modelo'));
    });

    $('#confirmar_reactivar_equipo_btn').on('click', function() {
        var id = $('#id_equipo_a_reactivar').val();

        var formData = new FormData();
        formData.append('id', id);

        fetch(urlBase + 'reactivar/', {
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
                tabla.row($('#controls-table a.btn-reactivar[data-id="' + id + '"]').closest("tr")).remove().draw(false);
                bootstrap.Modal.getInstance(document.getElementById('reactivarEquipo')).hide();
                mostrarAlerta('success', data.mensaje, false);
            } else {
                mostrarAlerta('error', data.mensaje, true);
            }
        })
        .catch(function(err) {
            mostrarAlerta('error', err.message || 'Error de conexión', true);
        });
    });
});