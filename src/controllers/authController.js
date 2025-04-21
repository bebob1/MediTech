const User = require('../models/User');
const Equipo = require('../models/Equipo');
const { comparePassword } = require('../utils/passwordUtils');
const bcrypt = require('bcrypt'); // Asegúrate de importar bcrypt para el hash de contraseñas

// Renderizar página de login
exports.getLogin = (req, res) => {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('login', {
      title: 'Iniciar Sesión',
      error: null,
      req
    });
};
  
// Manejar inicio de sesión
exports.postLogin = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Validar campos
    if (!correo || !password) {
      return res.render('login', { 
        title: 'Iniciar Sesión', 
        error: 'Todos los campos son obligatorios' 
      });
    }
    
    // Buscar usuario por correo
    const user = await User.findByEmail(correo);

    if (!user) {
      return res.render('login', { 
        title: 'Iniciar Sesión', 
        error: 'Correo no encontrado.', 
        req
      });
    }

    // Verificar contraseña
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.render('login', { 
        title: 'Iniciar Sesión', 
        error: 'La contraseña no es correcta.', 
        req
      });
    }

    
    // Crear sesión
    req.session.userId = user.id;
    // Establecer el rol del usuario en la sesión
    req.session.userRole = user.rol_id;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
    res.render('login', { 
      title: 'Iniciar Sesión', 
      error: 'Error al iniciar sesión. Inténtalo de nuevo.' 
    });
  }
};

// Renderizar página de registro
exports.getRegister = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { title: 'Registro', error: null });
};

// Manejar registro de usuario
exports.postRegister = async (req, res) => {
  try {
    const { nombre, correo, centro_operacion, password, confirmPassword } = req.body;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.render('register', { 
        title: 'Registro', 
        error: 'Las contraseñas no coinciden' 
      });
    }
    
    // Obtener el ID del rol 'doctor'
    const doctorRolId = await User.findRoleIdByName('doctor');
    
    if (!doctorRolId) {
      throw new Error('No se pudo asignar el rol de doctor. Contacte al administrador.');
    }
    
    // Crear usuario con rol de doctor por defecto
    await User.create({ 
      nombre, 
      correo, 
      centro_operacion, 
      password,
      rol_id: doctorRolId
    });
    
    res.redirect('/login?registered=true');
  } catch (error) {
    console.error('Error en registro:', error);
    res.render('register', { 
      title: 'Registro', 
      error: error.message || 'Error al registrar usuario' 
    });
  }
};

  // Renderizar dashboard
  exports.getDashboard = async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.redirect('/login');
      }
      
      // Obtener datos del usuario actual
      const user = await User.findById(userId);
      
      if (!user) {
        req.session.destroy();
        return res.redirect('/login');
      }
      
      const equipoModel = new Equipo();
      const equipos = await equipoModel.getEquiposFallasByUsuario(userId);
      
      res.render('dashboard', {
        user: user,
        equipos: equipos,
        title: 'Dashboard'
      });
    } catch (error) {
      console.error('Error en dashboard:', error);
      res.status(500).render('error', {
        title: 'Error del servidor',
        message: 'Error al cargar el dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  };
  
// Cerrar sesión
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
};

// Obtener historial
exports.getHistorial = async (req, res) => {
  try {
    // Obtener el ID del usuario actual
    const userId = req.session.userId;
    
    if (!userId) {
      return res.redirect('/login');
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    // Buscar equipos consultados por este usuario
    const equipos = await Equipo.getEquiposFallasByUsuario(userId);
    
    res.render('historial', {
      title: 'Historial de Equipos',
      user,
      equipos
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.redirect('/dashboard');
  }
};

// Obtener perfil
exports.getPerfil = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.redirect('/login');
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    res.render('perfil', {
      title: 'Mi Perfil',
      user
    });
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    res.redirect('/dashboard');
  }
};

// Actualizar perfil - CORREGIDO
exports.updateProfile = async (req, res) => {
  try {
    console.log('Contenido de req.body:', req.body);
    
    // Verificar que req.body existe
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'No se recibieron datos' });
    }
    
    const { nombre, correo, centro_operacion, password } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    
    // Buscar el usuario en la base de datos
    const usuario = await User.findById(userId);
    
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Preparar datos de actualización
    const updateData = {
      nombre,
      correo,
      centro_operacion
    };
    
    // Actualizar contraseña si se proporciona
    if (password && password.trim() !== '') {
      // Generar hash para la nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    
    // Actualizar usuario
    await User.update(userId, updateData);
    
    // Responder con éxito
    return res.status(200).json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar perfil: ' + error.message });
  }
};