const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { getHistorialDashboard, getHistorialDiagnosticos } = require('../controllers/historialDiagnosticoController');
const diagnosticoBayesianoController = require('../controllers/diagnosticoBayesianoController');

// Rutas públicas
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Rutas protegidas
router.get('/dashboard', isAuthenticated, authController.getDashboard, getHistorialDashboard);
router.get('/historial', isAuthenticated, authController.getHistorial, getHistorialDiagnosticos);
router.get('/perfil', isAuthenticated, authController.getPerfil);
router.post('/update-profile', isAuthenticated, authController.updateProfile);

// Rutas para diagnóstico
router.get('/diagnostico/:equipoId/:equipoNombre', isAuthenticated, require('../controllers/diagnosticoController').getEquipoDiagnostico);
router.post('/procesar-diagnostico', isAuthenticated, require('../controllers/diagnosticoController').procesarDiagnostico);
router.get('/detalle-diagnostico/:diagnosticoId', isAuthenticated, require('../controllers/historialDiagnosticoController').getDetalleDiagnostico);
router.post('/procesar-diagnostico-bayesiano', isAuthenticated, require('../controllers/diagnosticoBayesianoController').procesarDiagnosticoBayesiano);


module.exports = router;