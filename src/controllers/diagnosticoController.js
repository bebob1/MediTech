const Equipo = require('../models/Equipo');

// Controlador para mostrar la página de diagnóstico
exports.getEquipoDiagnostico = async (req, res) => {
  try {
    const equipoId = req.params.equipoId;
    const equipoNombre = req.params.equipoNombre;
    
    // Verificar si el usuario está autenticado
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    // Las preguntas para el diagnóstico (ejemplo)
    const preguntas = [
      "¿El equipo enciende correctamente?",
      "¿Se observan mensajes de error en la pantalla?",
      "¿El equipo emite algún sonido anormal?",
      "¿Ha presentado este problema anteriormente?"
    ];
    
    res.render('diagnostico', {
      title: `Diagnóstico de ${equipoNombre}`,
      equipoId: equipoId,
      equipoNombre: equipoNombre,
      preguntas: preguntas
    });
  } catch (error) {
    console.error('Error al cargar diagnóstico:', error);
    res.redirect('/dashboard');
  }
};

// Controlador para procesar las respuestas del diagnóstico
exports.procesarDiagnostico = async (req, res) => {
  try {
    const { equipoId, respuestas } = req.body;
    const userId = req.session.userId;
    
    if (!userId || !equipoId || !respuestas) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos' 
      });
    }
    
    // Aquí guardaríamos las respuestas y generaríamos un diagnóstico
    // Por ahora, solo regresamos un resultado de ejemplo
    
    return res.status(200).json({
      success: true,
      message: 'Diagnóstico procesado correctamente',
      diagnostico: 'Diagnóstico preliminar: Problema de alimentación eléctrica'
    });
  } catch (error) {
    console.error('Error al procesar diagnóstico:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el diagnóstico: ' + error.message 
    });
  }
};