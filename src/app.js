const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const { checkUser } = require('./middlewares/authMiddleware');

const app = express();

// Configuración de seguridad con helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware global para verificar usuario
app.use(checkUser);

// Rutas
app.use('/', authRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;