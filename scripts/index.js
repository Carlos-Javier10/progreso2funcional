// Variables globales para almacenar los productos y los productos seleccionados
let productosDisponibles = [];
let productosSeleccionados = [];
let idContador = 1; // Contador para generar IDs únicos para los productos seleccionados

// URL de la API de Pokémon
const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=5'; // Limitamos a 5 Pokémon para ejemplo

// Función para obtener datos de la API de Pokémon
async function obtenerDatosPokemon() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Verificar que se obtuvo la lista de resultados de Pokémon
        if (data.results) {
            // Mapear los datos para obtener solo los nombres y urls de los Pokémon
            productosDisponibles = data.results.map((pokemon, index) => {
                return {
                    id: index + 1, // Generamos un ID simple
                    nombre: pokemon.name, // El nombre del Pokémon será el nombre del producto
                    imagenUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`, // URL de la imagen del Pokémon
                    cantidad: 1, // Ejemplo de cantidad inicial
                    stock: 10 // Ejemplo de stock
                };
            });

            // Llamar a la función para agregar filas a la tabla con los datos de los Pokémon
            agregarFilasProductos(productosDisponibles);
        } else {
            console.error('No se obtuvieron resultados de Pokémon desde la API.');
        }
    } catch (error) {
        console.error('Error al obtener datos desde la API de Pokémon:', error);
    }
}

// Función para agregar filas de productos a la tabla
function agregarFilasProductos(productos) {
    var tbody = document.getElementById('productTableBody');
    tbody.innerHTML = ''; // Limpiamos contenido existente

    productos.forEach(function(producto) {
        var row = '<tr>' +
                  '<td>' + producto.id + '</td>' +
                  '<td><img src="' + producto.imagenUrl + '" alt="' + producto.nombre + '"></td>' +
                  '<td>' + producto.nombre + '</td>' +
                  '<td>' + producto.cantidad + '</td>' +
                  '<td>' + producto.stock + '</td>' +
                  '<td><button onclick="seleccionarProducto(' + producto.id + ')">Seleccionar</button></td>' +
                  '</tr>';
        tbody.innerHTML += row;
    });
}

// Función para seleccionar un producto y agregarlo al carrito
function seleccionarProducto(idProducto) {
    // Buscar el producto por su ID en la lista de productos disponibles
    const producto = productosDisponibles.find(prod => prod.id === idProducto);

    if (producto) {
        // Verificar si el producto ya está en el carrito
        const existeEnCarrito = productosSeleccionados.find(prod => prod.id === producto.id);
        
        if (!existeEnCarrito) {
            // Agregar el producto al carrito
            productosSeleccionados.push({
                id: idContador++,
                nombre: producto.nombre,
                cantidad: producto.cantidad,
                nombreCliente: document.getElementById('nombreCliente').value.trim(),
                direccionCliente: document.getElementById('direccionCliente').value.trim()
            });

            // Actualizar la tabla del carrito
            actualizarCarrito();
            alert(`Producto ${producto.nombre} agregado al carrito.`);
        } else {
            alert(`El producto ${producto.nombre} ya está en el carrito.`);
        }
    } else {
        console.error('Producto no encontrado.');
    }
}

// Función para actualizar la tabla del carrito
function actualizarCarrito() {
    var tbody = document.getElementById('carritoTableBody');
    tbody.innerHTML = ''; // Limpiamos contenido existente

    productosSeleccionados.forEach(function(producto) {
        var row = '<tr>' +
                  '<td>' + producto.id + '</td>' +
                  '<td><img src="' + obtenerImagenPokemon(producto.nombre) + '" alt="' + producto.nombre + '"></td>' +
                  '<td>' + producto.nombre + '</td>' +
                  '<td>' + producto.cantidad + '</td>' +
                  '<td><button onclick="eliminarProducto(' + producto.id + ')">Eliminar</button></td>' +
                  '</tr>';
        tbody.innerHTML += row;
    });
}

// Función para obtener la URL de la imagen del Pokémon
function obtenerImagenPokemon(nombrePokemon) {
    // Buscar en la lista de productos disponibles la URL de la imagen del Pokémon por nombre
    const pokemon = productosDisponibles.find(pokemon => pokemon.nombre === nombrePokemon);
    if (pokemon) {
        return pokemon.imagenUrl;
    } else {
        console.error('No se encontró el Pokémon:', nombrePokemon);
        return ''; // Devolver cadena vacía si no se encuentra la imagen
    }
}

// Función para eliminar un producto del carrito
function eliminarProducto(idProducto) {
    // Filtrar el producto a eliminar del array de productos seleccionados
    productosSeleccionados = productosSeleccionados.filter(prod => prod.id !== idProducto);

    // Actualizar la tabla del carrito
    actualizarCarrito();
}

// Función para generar la factura y enviar datos a la base de datos
async function generarFactura() {
    // Verificar que haya productos en el carrito
    if (productosSeleccionados.length === 0) {
        alert('Agrega al menos un producto al carrito antes de proceder.');
        return;
    }

    // Generar contenido CSV
    let csvContent = "ID Producto,Nombre del Pokémon,Cantidad,Nombre del Cliente,Dirección del Cliente\n";
    productosSeleccionados.forEach(producto => {
        csvContent += `${producto.id},${producto.nombre},${producto.cantidad},${producto.nombreCliente},${producto.direccionCliente}\n`;
    });

    // Generar nombre de archivo CSV
    const filename = `Factura_${productosSeleccionados[0].nombreCliente.replace(/\s/g, '_')}.csv`;

    // Crear enlace de descarga para el archivo CSV generado
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Llamar a la función para enviar los datos a la base de datos
    await enviarOrdenCompra();
}

// Función para enviar la orden de compra al backend
async function enviarOrdenCompra() {
    try {
        // Construir el objeto de datos a enviar
        const data = {
            productos: productosSeleccionados
        };

        // Enviar la orden de compra al backend
        const response = await fetch('/guardar_orden', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Orden de compra enviada y guardada en la base de datos:', result);
            alert('La orden de compra se ha guardado correctamente.');
            // Limpiar carrito después de guardar la orden
            productosSeleccionados = [];
            actualizarCarrito(); // Actualizar la tabla del carrito vacía
        } else {
            console.error('Error al enviar la orden de compra:', response.statusText);
            alert('Ocurrió un error al enviar la orden de compra.');
        }
    } catch (error) {
        console.error('Error en la petición fetch:', error);
        alert('Ocurrió un error en la petición para enviar la orden de compra.');
    }
}

// Llamamos a la función para cargar los datos de la API de Pokémon al cargar la página
window.onload = function() {
    obtenerDatosPokemon();
};
