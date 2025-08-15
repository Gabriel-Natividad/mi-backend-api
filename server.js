const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Tu usuario de MySQL
    password: '4224010399', // Tu contraseña de MySQL
    database: 'proyectofinal' // Tu base de datos
});

// Conectar a MySQL
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos de MySQL.');
});

// Middlewares
app.use(cors());
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones

// ==========================================================
// ➡️ Lógica de Endpoints para Usuarios y Conductores
// ==========================================================

// Endpoint de Registro de Usuario
app.post('/api/register', (req, res) => {
    const { nombre, email, contrasena } = req.body;
    const apellido = 'N/A';

    if (!nombre || !email || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const query = 'INSERT INTO usuarios (nombre, apellido, email, contrasena) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, apellido, email, contrasena], (err, result) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ message: 'Error interno del servidor. El email podría estar ya registrado.' });
        }
        res.status(201).json({ message: 'Usuario registrado con éxito.' });
    });
});

// ... (código anterior) ...

// Endpoint de Inicio de Sesión
app.post('/api/login', (req, res) => {
    const { email, contrasena, rol } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    let query;
    let table;
    let params;

    // Determina en qué tabla buscar según el rol
    if (rol === 'conductor') {
        table = 'conductor'; // ➡️ ¡CAMBIADO AQUÍ! Ahora es 'conductor'
        query = 'SELECT * FROM ?? WHERE email = ? AND contrasena = ?';
        params = [table, email, contrasena];
    } else {
        table = 'usuarios';
        query = 'SELECT * FROM ?? WHERE email = ? AND contrasena = ?';
        params = [table, email, contrasena];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error en el login:', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        if (results.length > 0) {
            const user = results[0];
            return res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: rol
                }
            });
        } else {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
        }
    });
});

// ... (resto del código) ...
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
