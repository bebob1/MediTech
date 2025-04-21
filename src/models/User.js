const { pool } = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');
const validator = require('validator');

class User {
  // Crear un nuevo usuario
  static async create(userData) {
    const { nombre, correo, centro_operacion, password, rol_id } = userData;
    
    // Validaciones
    if (!nombre || !correo || !centro_operacion || !password) {
      throw new Error('Todos los campos son obligatorios');
    }
    
    if (!validator.isEmail(correo)) {
      throw new Error('Correo electrónico inválido');
    }
    
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
      // Verificar si el correo ya existe
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE correo = ?', 
        [correo]
      );
      
      if (existingUser.length > 0) {
        throw new Error('El correo electrónico ya está registrado');
      }
      
      // Cifrar la contraseña
      const hashedPassword = await hashPassword(password);
      
      // Insertar usuario en la base de datos con rol_id
      const query = 'INSERT INTO users (nombre, correo, centro_operacion, password, rol_id) VALUES (?, ?, ?, ?, ?)';
      const params = [nombre, correo, centro_operacion, hashedPassword, rol_id];
      
      const [result] = await pool.query(query, params);
      
      return { id: result.insertId, nombre, correo, centro_operacion, rol_id };
    } catch (error) {
      throw error;
    }
  }
  
  // Buscar usuario por correo
  static async findByEmail(correo) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE correo = ?', 
        [correo]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Buscar usuario por ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre, correo, centro_operacion, rol_id FROM users WHERE id = ?', 
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // Encontrar ID de rol por nombre
  static async findRoleIdByName(roleName) {
    try {
      const [rows] = await pool.query(
        'SELECT id FROM roles WHERE nombre = ?',
        [roleName]
      );
      
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      throw error;
    }
  }


  // Actualizar usuario por ID
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error('No se proporcionaron datos para actualizar');
    }

    values.push(id); // Agregar ID al final para WHERE

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await pool.query(query, values);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;