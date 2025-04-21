const User = require('../models/User');

// Middleware para verificar si el usuario está autenticado
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Middleware para guardar información del usuario en variables locales
exports.checkUser = async (req, res, next) => {
  res.locals.user = null;
  
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        res.locals.user = user;
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
    }
  }
  
  next();
};