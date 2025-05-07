const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const pool = mysql.createPool(dbConfig);

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    
    const conn = await pool.getConnection();
    console.log('Creando nuevas tablas...');
    
    // Tabla roles
    const createRolesTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createRolesTableQuery);
    console.log('Tabla roles creada correctamente');

    // Insertar roles
    const insertRolesQuery = `
      INSERT IGNORE INTO roles (id, nombre, descripcion, created_at) VALUES
      (1, 'admin', 'Administrador del sistema', NOW()),
      (2, 'doctor', 'Usuario médico', NOW()),
      (3, 'ingeniero', 'Ingeniero de servicio técnico', NOW())
    `;
    await conn.query(insertRolesQuery);
    console.log('Roles insertados correctamente');

    // Tabla usuarios
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        centro_operacion VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
      )
    `;
    await conn.query(createUsersTableQuery);
    console.log('Tabla users creada correctamente');
    
    // Tabla equipos
    const createEquiposTableQuery = `
      CREATE TABLE IF NOT EXISTS equipos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        numero_serie VARCHAR(100) NOT NULL UNIQUE,
        ubicacion VARCHAR(255),
        centro_id VARCHAR(100) NOT NULL,
        estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
        imagen VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createEquiposTableQuery);
    console.log('Tabla equipos creada correctamente');

    // Insertar equipos médicos
    const insertEquiposQuery = `
      INSERT IGNORE INTO equipos (nombre, modelo, numero_serie, ubicacion, centro_id, estado, imagen) VALUES
      ('Ventilador mecánico', 'VentiMax Pro-2000', 'VM20231001', 'UCI - Sala 3', 'HOSP001', 'activo', '/imagenes/ventilador.png'),
      ('Monitor de signos vitales', 'VitalMonitor X5', 'MSV20230587', 'Emergencias - Box 2', 'HOSP001', 'activo', '/imagenes/monitor.png'),
      ('Bomba de infusión', 'InfuSystem Plus', 'BI20232145', 'Hospitalización - Piso 4', 'HOSP001', 'activo', '/imagenes/bomba.png'),
      ('Desfibrilador', 'CardioShock D300', 'DF20231234', 'Reanimación - Sala 1', 'HOSP001', 'activo', '/imagenes/desfibrilador.png'),
      ('Electrocardiógrafo', 'CardioGraph ECG12', 'EC20230076', 'Cardiología - Consultorio 5', 'HOSP001', 'activo', '/imagenes/electrocardio.png')
    `;
    await conn.query(insertEquiposQuery);
    console.log('Equipos médicos insertados correctamente');

    // Tabla diagnosticos
    const createDiagnosticosTableQuery = `
      CREATE TABLE IF NOT EXISTS diagnosticos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        equipo_id INT NOT NULL,
        usuario_id INT NOT NULL,
        respuestas TEXT,
        diagnostico TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipo_id) REFERENCES equipos(id),
        FOREIGN KEY (usuario_id) REFERENCES users(id)
      )
    `;
    await conn.query(createDiagnosticosTableQuery);
    console.log('Tabla diagnosticos creada correctamente');

    // Tabla diagnostico_sintomas (sin sintomas)
    const createDiagnosticoSintomasTableQuery = `
      CREATE TABLE IF NOT EXISTS diagnostico_sintomas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        diagnostico_id INT NOT NULL,
        peso FLOAT DEFAULT 1.0,
        FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id)
      )
    `;
    await conn.query(createDiagnosticoSintomasTableQuery);
    console.log('Tabla diagnostico_sintomas creada correctamente');

    conn.release();
    console.log('Base de datos inicializada correctamente con datos de prueba');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDb();

module.exports = {
  pool,
  initDb
};
