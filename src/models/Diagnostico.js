const { pool } = require('../config/db');

class Diagnostico {
  // Obtener todos los diagnósticos
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, e.nombre as equipo_nombre, u.nombre as usuario_nombre 
        FROM diagnosticos d
        JOIN equipos e ON d.equipo_id = e.id
        JOIN users u ON d.usuario_id = u.id
        ORDER BY d.fecha DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener diagnósticos por equipo
  static async getByEquipo(equipoId) {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, u.nombre as usuario_nombre 
        FROM diagnosticos d
        JOIN users u ON d.usuario_id = u.id
        WHERE d.equipo_id = ?
        ORDER BY d.fecha DESC
      `, [equipoId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener diagnósticos por usuario
  static async getByUsuario(usuarioId) {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, e.nombre as equipo_nombre 
        FROM diagnosticos d
        JOIN equipos e ON d.equipo_id = e.id
        WHERE d.usuario_id = ?
        ORDER BY d.fecha DESC
      `, [usuarioId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Obtener un diagnóstico por ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, e.nombre as equipo_nombre, u.nombre as usuario_nombre 
        FROM diagnosticos d
        JOIN equipos e ON d.equipo_id = e.id
        JOIN users u ON d.usuario_id = u.id
        WHERE d.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Crear un nuevo diagnóstico
  static async crear(diagnosticoData) {
    const { equipo_id, usuario_id, respuestas, diagnostico, fecha } = diagnosticoData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO diagnosticos (equipo_id, usuario_id, respuestas, diagnostico, fecha) VALUES (?, ?, ?, ?, ?)',
        [equipo_id, usuario_id, respuestas, diagnostico, fecha]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // Actualizar diagnóstico (por ejemplo, para añadir notas o actualizar el estado)
  static async actualizar(id, datosActualizados) {
    const { diagnostico, notas, estado } = datosActualizados;
    
    try {
      const [result] = await pool.query(
        'UPDATE diagnosticos SET diagnostico = ?, notas = ?, estado = ? WHERE id = ?',
        [diagnostico, notas, estado, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Eliminar un diagnóstico
  static async eliminar(id) {
    try {
      const [result] = await pool.query('DELETE FROM diagnosticos WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Diagnostico;