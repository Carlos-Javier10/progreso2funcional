from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

# Configuración de la conexión a MySQL
db_connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="1750",
  database="myshop"
)

# Ruta de prueba para verificar la conexión
@app.route('/test_connection', methods=['GET'])
def test_connection():
    try:
        db_connection.ping()  # Intenta hacer ping a la base de datos para verificar la conexión
        return jsonify({'message': 'Conexión exitosa a la base de datos MySQL.'}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
