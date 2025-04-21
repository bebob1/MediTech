const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Inicializar la base de datos
async function initDb() {
  try {
    // Crear la base de datos si no existe
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();
    
    const conn = await pool.getConnection();

    // Crear las tablas en el orden correcto
    console.log('Creando nuevas tablas...');
    
    // Crear la tabla de roles
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
    
    // Crear la tabla de usuarios
    const createTableQuery = `
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
    await conn.query(createTableQuery);
    console.log('Tabla users creada correctamente');
    
    // Crear la tabla de equipos médicos
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
    
    // Crear la tabla de síntomas
    const createSintomasTableQuery = `
      CREATE TABLE IF NOT EXISTS sintomas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descripcion VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createSintomasTableQuery);
    console.log('Tabla sintomas creada correctamente');
    
    // Crear la tabla de diagnósticos
    const createDiagnosticosTableQuery = `
      CREATE TABLE IF NOT EXISTS diagnosticos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        solucion_recomendada TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createDiagnosticosTableQuery);
    console.log('Tabla diagnosticos creada correctamente');
    
    // Crear la tabla de historial de fallas
    const createHistorialFallasTableQuery = `
      CREATE TABLE IF NOT EXISTS historial_fallas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        equipo_id INT NOT NULL,
        usuario_id INT NOT NULL,
        diagnostico_id INT NOT NULL,
        fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('reportado', 'en_proceso', 'resuelto') DEFAULT 'reportado',
        notas TEXT,
        FOREIGN KEY (equipo_id) REFERENCES equipos(id),
        FOREIGN KEY (usuario_id) REFERENCES users(id),
        FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id)
      )
    `;
    await conn.query(createHistorialFallasTableQuery);
    console.log('Tabla historial_fallas creada correctamente');
    
    // Crear tabla para relacionar síntomas con historial de fallas
    const createFallaSintomasTableQuery = `
      CREATE TABLE IF NOT EXISTS falla_sintomas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        falla_id INT NOT NULL,
        sintoma_id INT NOT NULL,
        FOREIGN KEY (falla_id) REFERENCES historial_fallas(id),
        FOREIGN KEY (sintoma_id) REFERENCES sintomas(id)
      )
    `;
    await conn.query(createFallaSintomasTableQuery);
    console.log('Tabla falla_sintomas creada correctamente');
    
    // Crear tabla para relacionar síntomas con diagnósticos (para el sistema experto)
    const createDiagnosticoSintomasTableQuery = `
      CREATE TABLE IF NOT EXISTS diagnostico_sintomas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        diagnostico_id INT NOT NULL,
        sintoma_id INT NOT NULL,
        peso FLOAT DEFAULT 1.0, /* Peso o relevancia del síntoma para este diagnóstico */
        FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id),
        FOREIGN KEY (sintoma_id) REFERENCES sintomas(id)
      )
    `;
    await conn.query(createDiagnosticoSintomasTableQuery);
    console.log('Tabla diagnostico_sintomas creada correctamente');
    
    conn.release();
    
    console.log('Base de datos inicializada correctamente con todas las tablas recreadas');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

// Inicializar la base de datos al iniciar la aplicación
initDb();

module.exports = {
  pool,
  initDb
};