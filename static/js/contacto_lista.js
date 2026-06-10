document.addEventListener('DOMContentLoaded', function() {

    var page = document.getElementById('contactoPage');
    if (!page) return;
    var urlBase = page.dataset.urlBase;

    var tabla = $('#contactoTable').DataTable({
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
            loadingRecords: '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><div>Cargando...</div></div>',
            emptyTable: "No se encontraron registros",
            zeroRecords: "No se encontraron resultados"
        },
        order: [[0, 'desc']],
        columnDefs: [
            { orderable: false, targets: [3] }
        ]
    });

    $(document).on('click', '.btn-ver-contacto', function(e) {
        e.preventDefault();
        var id = $(this).data('id');

        document.getElementById('ver_id').value = id;
        document.getElementById('ver_nombre').value = '';
        document.getElementById('ver_email').value = '';
        document.getElementById('ver_empresa').value = '';
        document.getElementById('ver_telefono').value = '';
        document.getElementById('ver_asunto').value = '';
        document.getElementById('ver_mensaje').value = '';
        document.getElementById('ver_fecha').value = '';

        var urlDetalle = urlBase.replace('contacto-tabla', 'contacto-detalle');

        fetch(urlDetalle, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'id=' + encodeURIComponent(id)
        })
        .then(function(response) {
            var contentType = response.headers.get('content-type') || '';
            if (contentType.indexOf('application/json') === -1) {
                throw new Error('Error del servidor (' + response.status + ')');
            }
            return response.json();
        })
        .then(function(data) {
            if (data.ok) {
                document.getElementById('ver_nombre').value = data.data.nombre_completo;
                document.getElementById('ver_email').value = data.data.email;
                document.getElementById('ver_empresa').value = data.data.empresa;
                document.getElementById('ver_telefono').value = data.data.telefono;
                document.getElementById('ver_asunto').value = data.data.asunto;
                document.getElementById('ver_mensaje').value = data.data.mensaje;
                document.getElementById('ver_fecha').value = data.data.fecha_registro;

                var modalEl = document.getElementById('modalVerContacto');
                var modal = new bootstrap.Modal(modalEl);
                modal.show();
            } else {
                var modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalVerContacto'));
                if (modalInstance) modalInstance.hide();

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.mensaje || 'No se encontró el registro.',
                    confirmButtonColor: '#dc2626',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
            }
        })
        .catch(function(err) {
            var modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalVerContacto'));
            if (modalInstance) modalInstance.hide();

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: err.message || 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Reintentar',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        });
    });

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
});