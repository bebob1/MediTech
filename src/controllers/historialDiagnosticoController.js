const Diagnostico = require('../models/Diagnostico');
const Equipo = require('../models/Equipo');

// Mostrar historial de diagnósticos
exports.getHistorialDiagnosticos = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    const userId = req.session.userId;
    const esAdmin = req.session.userRole === 'admin'; // Asumiendo que tienes roles
    
    // Si es admin, obtener todos los diagnósticos; si no, solo los del usuario
    let diagnosticos;
    if (esAdmin) {
      diagnosticos = await Diagnostico.getAll();
    } else {
      diagnosticos = await Diagnostico.getByUsuario(userId);
    }
    
    res.render('historial-diagnosticos', {
      title: 'Historial de Diagnósticos',
      diagnosticos: diagnosticos,
      esAdmin: esAdmin
    });
  } catch (error) {
    console.error('Error al cargar historial de diagnósticos:', error);
    req.flash('error', 'Error al cargar el historial de diagnósticos');
    res.redirect('/dashboard');
  }
};

// Ver detalles de un diagnóstico específico
exports.getDetalleDiagnostico = async (req, res) => {
  try {
    const diagnosticoId = req.params.diagnosticoId;
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    const diagnostico = await Diagnostico.getById(diagnosticoId);
    
    if (!diagnostico) {
      req.flash('error', 'Diagnóstico no encontrado');
      return res.redirect('/historial-diagnosticos');
    }
    
    // Verificar que el usuario tenga acceso a este diagnóstico
    const esAdmin = req.session.userRole === 'admin';
    if (!esAdmin && diagnostico.usuario_id !== req.session.userId) {
      req.flash('error', 'No tienes permiso para ver este diagnóstico');
      return res.redirect('/historial-diagnosticos');
    }
    
    // Obtenemos información adicional del equipo
    const equipo = await Equipo.getById(diagnostico.equipo_id);
    
    res.render('detalle-diagnostico', {
      title: `Diagnóstico de ${diagnostico.equipo_nombre}`,
      diagnostico: diagnostico,
      equipo: equipo,
      esAdmin: esAdmin
    });
  } catch (error) {
    console.error('Error al cargar detalles del diagnóstico:', error);
    req.flash('error', 'Error al cargar los detalles del diagnóstico');
    res.redirect('/historial-diagnosticos');
  }
};

// Exportar diagnóstico a PDF (opcional, implementación básica)
exports.exportarDiagnosticoPDF = async (req, res) => {
  try {
    const diagnosticoId = req.params.diagnosticoId;
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    const diagnostico = await Diagnostico.getById(diagnosticoId);
    
    if (!diagnostico) {
      return res.status(404).json({ success: false, message: 'Diagnóstico no encontrado' });
    }
    
    // Aquí iría el código para generar un PDF con los datos del diagnóstico
    // Por ahora, solo devolvemos un mensaje indicando que la función está en desarrollo
    
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de exportación a PDF en desarrollo'
    });
  } catch (error) {
    console.error('Error al exportar diagnóstico a PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar el diagnóstico: ' + error.message
    });
  }
};