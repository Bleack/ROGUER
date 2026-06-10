document.addEventListener('DOMContentLoaded', function() {

    var colores = ['#265d81', '#863244', '#8b7334', '#2f8383', '#503781', '#81562b'];

    function formatNumero(num) {
        return num.toLocaleString('es-CL');
    }

    function obtenerColor(index) {
        return colores[index % colores.length];
    }

    function ticksEnteros() {
        return {
            color: 'white',
            font: { size: 12 },
            precision: 0,
            stepSize: 1
        };
    }

    fetch('/panel/datos/')
        .then(function(response) {
            var contentType = response.headers.get('content-type') || '';
            if (contentType.indexOf('application/json') === -1) {
                throw new Error('Error del servidor');
            }
            return response.json();
        })
        .then(function(data) {
            var resumen = data.resumen;
            var items = document.querySelectorAll('.lista .valor');
            if (items.length >= 4) {
                items[0].textContent = formatNumero(resumen.equipos_totales);
                items[1].textContent = formatNumero(resumen.equipos_prestados);
                items[2].textContent = formatNumero(resumen.equipos_en_oficinas);
                items[3].textContent = formatNumero(resumen.prestamos_activos);
            }

            new Chart(document.getElementById('chartDevoluciones'), {
                type: 'doughnut',
                data: {
                    labels: ['Devuelto', 'No devuelto'],
                    datasets: [{
                        data: [data.devoluciones.devuelto, data.devoluciones.no_devuelto],
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '50%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            new Chart(document.getElementById('chartBarras'), {
                type: 'bar',
                data: {
                    labels: data.equipos_por_categoria.map(function(c) { return c.nombre; }),
                    datasets: [{
                        label: 'Equipos',
                        data: data.equipos_por_categoria.map(function(c) { return c.total; }),
                        backgroundColor: data.equipos_por_categoria.map(function(c, i) { return obtenerColor(i); }),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 5 }
                    },
                    scales: {
                        y: {
                            ticks: ticksEnteros(),
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: {
                            ticks: { color: 'white', font: { size: 12 } },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            new Chart(document.getElementById('chartBarras2'), {
                type: 'bar',
                data: {
                    labels: data.prestamos_por_categoria.map(function(c) { return c.nombre; }),
                    datasets: [{
                        label: 'Préstamos',
                        data: data.prestamos_por_categoria.map(function(c) { return c.total; }),
                        backgroundColor: data.prestamos_por_categoria.map(function(c, i) { return obtenerColor(i); }),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 5 }
                    },
                    scales: {
                        y: {
                            ticks: ticksEnteros(),
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: {
                            ticks: { color: 'white', font: { size: 12 } },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            new Chart(document.getElementById('chartBarras3'), {
                type: 'bar',
                data: {
                    labels: data.top_usuarios.map(function(u) { return u.nombre; }),
                    datasets: [{
                        label: 'Préstamos',
                        data: data.top_usuarios.map(function(u) { return u.total; }),
                        backgroundColor: data.top_usuarios.map(function(u, i) { return obtenerColor(i); }),
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 5 }
                    },
                    scales: {
                        x: {
                            ticks: ticksEnteros(),
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        y: {
                            ticks: { color: 'white', font: { size: 12 } },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        })
        .catch(function(err) {
            console.error('Error cargando datos del panel:', err);
        });
});