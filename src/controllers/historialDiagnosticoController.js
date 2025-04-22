const Diagnostico = require('../models/Diagnostico');
const Equipo = require('../models/Equipo');

// Mostrar historial de diagnósticos
// En historialDiagnosticoController.js
exports.getHistorialDiagnosticos = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }
      
      const userId = req.session.userId;
      const esAdmin = req.session.userRole === 'admin';
      
      let diagnosticos;
      if (esAdmin) {
        diagnosticos = await Diagnostico.getAll();
      } else {
        diagnosticos = await Diagnostico.getByUsuario(userId);
      }
  
      // Obtener información de equipos para cada diagnóstico dashboard
      const diagnosticosConEquipos = await Promise.all(diagnosticos.map(async (diagnostico) => {
        try {
          const equipo = await Equipo.getById(diagnostico.equipo_id);
          return {
            ...diagnostico,
            equipo_nombre: equipo ? equipo.nombre : 'Equipo desconocido',
            equipo_imagen: equipo ? equipo.imagen : 'default.png'
          };
        } catch (error) {
          console.error('Error al obtener equipo:', error);
          return {
            ...diagnostico,
            equipo_nombre: 'Equipo desconocido',
            equipo_imagen: 'default.png'
          };
        }
      }));
  
      res.render('dashboard', {
        title: 'Dashboard',
        diagnosticos: diagnosticos,  // Cambiado de 'equipos' a 'diagnosticos'
        user: {
          id: req.session.userId,
          nombre: req.session.userName,
          centro_operacion: req.session.userCentroOperacion
        },
        esAdmin: esAdmin
      });
    } catch (error) {
      console.error('Error al cargar historial de diagnósticos:', error);
      if (req.flash) {
        req.flash('error', 'Error al cargar el historial de diagnósticos');
      }
      res.redirect('/dashboard');
    }
  };

  
  exports.getHistorialDashboard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.redirect('/login');
      }
      
      const userId = req.session.userId;
      const esAdmin = req.session.userRole === 'admin';
      
      let diagnosticos;
      if (esAdmin) {
        diagnosticos = await Diagnostico.getAll();
      } else {
        diagnosticos = await Diagnostico.getByUsuario(userId);
      }
  
      // Obtener información de equipos para cada diagnóstico
      const diagnosticosConEquipos = await Promise.all(diagnosticos.map(async (diagnostico) => {
        try {
          const equipo = await Equipo.getById(diagnostico.equipo_id);
          return {
            ...diagnostico,
            equipo_nombre: equipo ? equipo.nombre : 'Equipo desconocido',
            equipo_imagen: equipo ? equipo.imagen : 'default.png'
          };
        } catch (error) {
          console.error('Error al obtener equipo:', error);
          return {
            ...diagnostico,
            equipo_nombre: 'Equipo desconocido',
            equipo_imagen: 'default.png'
          };
        }
      }));
  
      res.render('historial', {
        title: 'Historial',
        diagnosticos: diagnosticos,  // Cambiado de 'equipos' a 'diagnosticos'
        user: {
          id: req.session.userId,
          nombre: req.session.userName,
          centro_operacion: req.session.userCentroOperacion
        },
        esAdmin: esAdmin
      });
    } catch (error) {
      console.error('Error al cargar historial de diagnósticos:', error);
      if (req.flash) {
        req.flash('error', 'Error al cargar el historial de diagnósticos');
      }
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
      
      // Consultar el diagnóstico por ID
      const diagnostico = await Diagnostico.getById(diagnosticoId);
      
      if (!diagnostico) {
        console.log('Diagnóstico no encontrado:', diagnosticoId);
        
        // Manejar el caso de que req.flash no esté disponible
        if (req.flash) {
          req.flash('error', 'Diagnóstico no encontrado');
        }
        
        return res.redirect('/historial');
      }
      
      // Verificar que el usuario tenga acceso a este diagnóstico
      const esAdmin = req.session.userRole === 'admin';
      if (!esAdmin && diagnostico.usuario_id != req.session.userId) {
        
        // Manejar el caso de que req.flash no esté disponible
        if (req.flash) {
          req.flash('error', 'No tienes permiso para ver este diagnóstico');
        }
        
        return res.redirect('/historial');
      }
      
      // Obtener información adicional del equipo
      let equipo = null;
      try {
        equipo = await Equipo.getById(diagnostico.equipo_id);
      } catch (equipoError) {
        console.error('Error al obtener equipo:', equipoError);
        // Continuamos incluso si no se puede obtener el equipo
      }
      
      // Manejo mejorado para las respuestas del cuestionario
      let respuestas = [];
      try {
        if (diagnostico.respuestas) {
          if (typeof diagnostico.respuestas === 'string') {
            // Intenta parsear si es un string
            respuestas = JSON.parse(diagnostico.respuestas);
          } else if (typeof diagnostico.respuestas === 'object') {
            // Si ya es un objeto, úsalo directamente
            respuestas = diagnostico.respuestas;
          }
        }
        
        // Verifica que sea un array (para el caso de que sea un objeto o null)
        if (!Array.isArray(respuestas)) {
          respuestas = [];
        }
        
      } catch (parseError) {
        console.error('Error al parsear respuestas:', parseError);
        console.error('Valor de respuestas:', diagnostico.respuestas);
        respuestas = [];
      }
      
      // Asigna las respuestas procesadas al diagnóstico
      diagnostico.respuestasArray = respuestas;
      
      // Renderizar la vista con los datos
      return res.render('detalle-diagnostico', {
        title: `Detalle de Diagnóstico ${diagnostico.id}`,
        diagnostico: diagnostico,
        equipo: equipo,
        esAdmin: esAdmin,
        tieneRespuestas: respuestas.length > 0
      });
    } catch (error) {
      console.error('Error al cargar detalles del diagnóstico:', error);
      
      // Manejar el caso de que req.flash no esté disponible
      if (req.flash) {
        req.flash('error', 'Error al cargar los detalles del diagnóstico: ' + error.message);
      }
      
      return res.redirect('/historial');
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