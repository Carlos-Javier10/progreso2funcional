from flask import Flask, request, jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)

# Configuración de la base de datos MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '1750'
app.config['MYSQL_DB'] = 'myshop'

mysql = MySQL(app)

# Ruta para guardar la orden de compra
@app.route('/guardar_orden', methods=['POST'])
def guardar_orden():
    try:
        data = request.get_json()
        productos = data['productos']

        # Conectar con la base de datos y guardar los productos en la tabla ordencompras
        cur = mysql.connection.cursor()
        for producto in productos:
            cur.execute("INSERT INTO ordencompras (id_producto, nombre_pokemon, cantidad, nombre_cliente, direccion_cliente) VALUES (%s, %s, %s, %s, %s)",
                        (producto['id'], producto['nombre'], producto['cantidad'], producto['nombreCliente'], producto['direccionCliente']))
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Orden de compra guardada correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
