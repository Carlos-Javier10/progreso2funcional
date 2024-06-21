// Función para mostrar la factura desde un archivo CSV seleccionado por el usuario
function mostrarFactura() {
    // Obtener el elemento de entrada de archivo
    const fileInput = document.getElementById('fileInput');
    
    // Verificar si se ha seleccionado un archivo
    if (fileInput.files.length === 0) {
        alert('Por favor selecciona un archivo CSV.');
        return;
    }

    // Obtener el archivo seleccionado
    const file = fileInput.files[0];
    const filename = file.name.toLowerCase();

    // Verificar si el archivo seleccionado es un archivo CSV
    if (!filename.endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV.');
        return;
    }

    // Crear un objeto FileReader para leer el contenido del archivo CSV
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;

        // Parsear el CSV
        const lines = csv.split('\n');
        const tableData = lines.map(line => {
            const columns = line.split(',');

            // Verificar si la línea está vacía o mal formateada
            if (line.trim() === '' || columns.length !== 5) {
                return null; // Ignorar líneas vacías o mal formateadas
            }

            return {
                idProducto: columns[0],
                nombrePokemon: columns[1],
                cantidad: columns[2],
                nombreCliente: columns[3],
                direccionCliente: columns[4]
            };
        }).filter(data => data !== null); // Filtrar elementos nulos (líneas ignoradas)

        // Construir la tabla HTML
        let tableHtml = '';
        tableData.forEach(data => {
            tableHtml += '<tr>' +
                            '<td>' + data.idProducto + '</td>' +
                            '<td>' + data.nombrePokemon + '</td>' +
                            '<td>' + data.cantidad + '</td>' +
                            '<td>' + data.nombreCliente + '</td>' +
                            '<td>' + data.direccionCliente + '</td>' +
                        '</tr>';
        });

        // Mostrar la tabla en el contenedor de la factura
        const facturaTableBody = document.getElementById('facturaTableBody');
        facturaTableBody.innerHTML = tableHtml;
    };

    // Leer el contenido del archivo como texto
    reader.readAsText(file);
}
