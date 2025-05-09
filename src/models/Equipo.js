const { pool } = require('../config/db');

class Equipo {
  // Obtener todos los equipos
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM equipos');
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener un equipo por ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM equipos WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Crear un nuevo equipo
  static async create(equipoData) {
    const { nombre, modelo, numero_serie, ubicacion, centro_id, imagen } = equipoData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO equipos (nombre, modelo, numero_serie, ubicacion, centro_id, imagen) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, modelo, numero_serie, ubicacion, centro_id, imagen]
      );
      
      return { id: result.insertId, ...equipoData };
    } catch (error) {
      throw error;
    }
  }
  
  async getEquiposFallasByUsuario(usuarioId) {
    try {
      const query = `
        SELECT e.id, e.nombre, e.modelo, e.imagen, d.fecha, 
              d.diagnostico AS falla_principal
        FROM diagnosticos d
        JOIN equipos e ON d.equipo_id = e.id
        WHERE d.usuario_id = ?
        ORDER BY d.fecha DESC
      `;
      const [rows] = await pool.query(query, [usuarioId]);
      return rows;
    } catch (error) {
      console.error('Error al obtener equipos con fallas del usuario:', error);
      throw error;
    }
  }
  
  // Reportar una falla de equipo
  static async reportarFalla(fallaData) {
    const { equipo_id, usuario_id, diagnostico_id, notas } = fallaData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO historial_fallas (equipo_id, usuario_id, diagnostico_id, notas) VALUES (?, ?, ?, ?)',
        [equipo_id, usuario_id, diagnostico_id, notas]
      );
      
      // Si hay síntomas, insertarlos en la tabla de relación
      if (fallaData.sintomas && fallaData.sintomas.length > 0) {
        const falla_id = result.insertId;
        const sintomasValues = fallaData.sintomas.map(sintoma_id => [falla_id, sintoma_id]);
        
        await pool.query(
          'INSERT INTO falla_sintomas (falla_id, sintoma_id) VALUES ?',
          [sintomasValues]
        );
      }
      
      return { id: result.insertId, ...fallaData };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Equipo;