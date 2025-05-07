const Equipo = require('../models/Equipo');

const Diagnostico = require('../models/Diagnostico'); // Asumimos que crearás este modelo



// Controlador para mostrar la página de diagnóstico

exports.getEquipoDiagnostico = async (req, res) => {

  try {

    const equipoId = req.params.equipoId;

    const equipoNombre = req.params.equipoNombre;

    

    // Verificar si el usuario está autenticado

    if (!req.session.userId) {

      return res.redirect('/login');

    }

    

    // Obtenemos información del equipo

    const equipo = await Equipo.getById(equipoId);

    if (!equipo) {

      req.flash('error', 'Equipo no encontrado');

      return res.redirect('/dashboard');

    }

    

    // Preguntas generales para todos los equipos

    const preguntasGenerales = [

      "¿El equipo enciende correctamente?",

      "¿El cable de alimentación está bien conectado?",

      "¿La batería está bien instalada?",

      "¿Hay elementos extraños ejerciendo presión sobre los controles del equipo?",

      "¿El fusible está en buen estado?",

      "¿Hay suministro eléctrico en la toma donde está conectado el equipo?"

    ];

    

    // Preguntas específicas basadas en los problemas comunes identificados en el árbol de decisiones

    const preguntasEspecificas = [

      // Conectividad y cables

      "¿Los cables están correctamente conectados al equipo?",

      "¿Los cables presentan daños visibles?",

      "¿Las conexiones al paciente están correctamente instaladas?",

      

      // Sensores y mediciones

      "¿El equipo muestra lecturas anormales?",

      "¿Los sensores están correctamente colocados?",

      "¿El paciente tiene elementos externos que puedan interferir (como esmalte en las uñas)?",

      

      // Alarmas y señales

      "¿El equipo muestra algún código de error?",

      "¿El equipo emite algún sonido anormal?",

      "¿El equipo muestra interferencia en la señal?",

      

      // Funcionamiento mecánico

      "¿Las partes móviles del equipo funcionan correctamente?",

      "¿Se observa algún ruido mecánico inusual?",

      

      // Consumibles y accesorios

      "¿Los consumibles del equipo están correctamente instalados?",

      "¿Los accesorios del equipo están en buen estado?",

      

      // Configuración

      "¿La configuración del equipo es correcta para la tarea que está realizando?",

      "¿Los filtros están bien configurados?",

      

      // Específicas para bombas

      "¿La bomba administra el medicamento correctamente?",

      "¿Se ha purgado la bomba adecuadamente?",

      "¿Hay burbujas visibles en las líneas?",

      "¿La cánula está bien colocada?",

      

      // Específicas para monitor de signos vitales

      "¿El monitor muestra problemas con la saturación de oxígeno (SpO2)?",

      "¿La pinza del oxímetro está bien ubicada?",

      

      // Específicas para desfibrilador

      "¿El desfibrilador entrega descarga?",

      "¿El equipo está correctamente sincronizado?",

      "¿El desfibrilador detecta señal cardíaca?",

      "¿Las palas están bien conectadas?",

      

      // Específicas para ECG

      "¿Se depiló la zona de contacto con los electrodos?",

      "¿El paciente está en contacto con algún elemento metálico?",

      

      // Específicas para ventilador

      "¿La presión se ajusta correctamente?",

      "¿Hay problemas en los sensores de flujo de la pieza de aire?"

    ];

    

    // Combinamos todas las preguntas

    const todasLasPreguntas = [...preguntasGenerales, ...preguntasEspecificas];

    

    res.render('diagnostico', {

      title: `Diagnóstico de ${equipoNombre}`,

      equipoId: equipoId,

      equipoNombre: equipoNombre,

      preguntas: todasLasPreguntas,

      arbolDecisiones: true // Indicamos que usaremos el árbol de decisiones

    });

  } catch (error) {

    console.error('Error al cargar diagnóstico:', error);

    req.flash('error', 'Error al cargar el diagnóstico');

    res.redirect('/dashboard');

  }

};



// Controlador para procesar las respuestas del diagnóstico
exports.procesarDiagnostico = async (req, res) => {
  try {
    const { equipoId, respuestas } = req.body;
    const userId = req.session.userId;
    
    console.log("Received equipment ID:", equipoId, "Type:", typeof equipoId);
    
    if (!userId || !equipoId || !respuestas) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos' 
      });
    }
    

    // Registramos las respuestas en la base de datos

    const fechaDiagnostico = new Date();

    

    // Aplicamos la lógica del árbol de decisiones para determinar el diagnóstico

    let diagnosticoResultado = determinarDiagnostico(respuestas);

    

    // Guardamos el diagnóstico en la base de datos

    const diagnosticoId = await Diagnostico.crear({

      equipo_id: equipoId,

      usuario_id: userId,

      respuestas: JSON.stringify(respuestas),

      diagnostico: diagnosticoResultado,

      fecha: fechaDiagnostico

    });

    

    return res.status(200).json({

      success: true,

      message: 'Diagnóstico procesado correctamente',

      diagnostico: diagnosticoResultado,

      diagnosticoId: diagnosticoId

    });

  } catch (error) {

    console.error('Error al procesar diagnóstico:', error);

    return res.status(500).json({ 

      success: false, 

      message: 'Error al procesar el diagnóstico: ' + error.message 

    });

  }

};



// Función para determinar el diagnóstico basado en las respuestas

function determinarDiagnostico(respuestas) {

  let resultado = '';

  

  // Verificamos primero si el equipo enciende

  const preguntaEncendido = respuestas.find(r => r.pregunta.includes("¿El equipo enciende correctamente?"));

  if (preguntaEncendido && preguntaEncendido.respuesta === 'No') {

    

    // Verificamos el cable

    const preguntaCable = respuestas.find(r => r.pregunta.includes("¿El cable de alimentación está bien conectado?"));

    if (preguntaCable && preguntaCable.respuesta === 'No') {

      resultado = 'Diagnóstico: Problema de conexión eléctrica. Revise el cable de alimentación y asegúrese de que esté correctamente conectado.';

      return resultado;

    }

    

    // Verificamos la batería

    const preguntaBateria = respuestas.find(r => r.pregunta.includes("¿La batería está bien instalada?"));

    if (preguntaBateria && preguntaBateria.respuesta === 'No') {

      resultado = 'Diagnóstico: Problema con la batería. Verifique que esté correctamente instalada y cargada.';

      return resultado;

    }

    

    // Verificamos elementos extraños

    const preguntaElementos = respuestas.find(r => r.pregunta.includes("¿Hay elementos extraños ejerciendo presión sobre los controles del equipo?"));

    if (preguntaElementos && preguntaElementos.respuesta === 'Sí') {

      resultado = 'Diagnóstico: Controles obstruidos. Despeje los controles del equipo de cualquier elemento extraño.';

      return resultado;

    }

    

    // Verificamos fusible

    const preguntaFusible = respuestas.find(r => r.pregunta.includes("¿El fusible está en buen estado?"));

    if (preguntaFusible && preguntaFusible.respuesta === 'No') {

      resultado = 'Diagnóstico: Fusible quemado. Reemplace el fusible por uno del mismo amperaje.';

      return resultado;

    }

    

    // Verificamos suministro eléctrico

    const preguntaSuministro = respuestas.find(r => r.pregunta.includes("¿Hay suministro eléctrico en la toma donde está conectado el equipo?"));

    if (preguntaSuministro && preguntaSuministro.respuesta === 'No') {

      resultado = 'Diagnóstico: No hay suministro eléctrico. Verifique la toma de corriente o use otra toma.';

      return resultado;

    }

    

    // Si ninguna de las causas comunes es el problema

    resultado = 'Diagnóstico: Posible fallo en la placa de circuito o problema interno. Se requiere revisión técnica especializada.';

    return resultado;

  }

  

  // Si el equipo enciende, verificamos otros problemas

  const preguntasConProblemas = respuestas.filter(r => r.respuesta === 'Sí' || r.respuesta === 'No')

                                       .filter(r => (r.pregunta.includes("¿") && r.respuesta === 'Sí') || 

                                                  (!r.pregunta.includes("¿El equipo enciende correctamente?") && r.respuesta === 'No'));

  

  if (preguntasConProblemas.length === 0) {

    resultado = 'Diagnóstico: No se detectaron problemas significativos en el equipo según las respuestas proporcionadas.';

    return resultado;

  }

  

  // Diagnósticos específicos para diferentes tipos de problemas

  

  // Problemas con cables o conexiones

  const problemaCables = respuestas.find(r => r.pregunta.includes("¿Los cables están correctamente conectados") && r.respuesta === 'No');

  const problemaDanosCables = respuestas.find(r => r.pregunta.includes("¿Los cables presentan daños visibles") && r.respuesta === 'Sí');

  

  if (problemaCables || problemaDanosCables) {

    resultado = 'Diagnóstico: Problema con los cables. ' + 

                (problemaCables ? 'Verifique que todos los cables estén correctamente conectados. ' : '') +

                (problemaDanosCables ? 'Los cables presentan daños visibles y pueden requerir reemplazo. ' : '');

    return resultado;

  }

  

  // Problemas con sensores

  const problemaSensores = respuestas.find(r => r.pregunta.includes("¿Los sensores están correctamente colocados") && r.respuesta === 'No');

  const problemaInterferencia = respuestas.find(r => r.pregunta.includes("¿El paciente tiene elementos externos") && r.respuesta === 'Sí');

  

  if (problemaSensores || problemaInterferencia) {

    resultado = 'Diagnóstico: Problema con los sensores o interferencia. ' + 

                (problemaSensores ? 'Verifique la correcta colocación de los sensores. ' : '') +

                (problemaInterferencia ? 'Retire elementos externos que puedan interferir con las lecturas (como esmalte de uñas). ' : '');

    return resultado;

  }

  

  // Problemas específicos para bombas

  const problemaBomba = respuestas.find(r => r.pregunta.includes("¿La bomba administra el medicamento correctamente") && r.respuesta === 'No');

  const problemaPurga = respuestas.find(r => r.pregunta.includes("¿Se ha purgado la bomba adecuadamente") && r.respuesta === 'No');

  const problemaBurbujas = respuestas.find(r => r.pregunta.includes("¿Hay burbujas visibles en las líneas") && r.respuesta === 'Sí');

  

  if (problemaBomba || problemaPurga || problemaBurbujas) {

    resultado = 'Diagnóstico: Problema con la bomba de infusión. ' + 

                (problemaPurga ? 'La bomba no se ha purgado adecuadamente. ' : '') +

                (problemaBurbujas ? 'Hay burbujas visibles en las líneas que deben ser eliminadas. ' : '') +

                ((!problemaPurga && !problemaBurbujas) ? 'Verifique la configuración y el correcto funcionamiento del motor. ' : '');

    return resultado;

  }

  

  // Problemas específicos para monitores

  const problemaSpO2 = respuestas.find(r => r.pregunta.includes("¿El monitor muestra problemas con la saturación de oxígeno") && r.respuesta === 'Sí');

  const problemaPinza = respuestas.find(r => r.pregunta.includes("¿La pinza del oxímetro está bien ubicada") && r.respuesta === 'No');

  

  if (problemaSpO2 || problemaPinza) {

    resultado = 'Diagnóstico: Problema con la medición de SpO2. ' + 

                (problemaPinza ? 'La pinza del oxímetro no está correctamente ubicada. ' : '') +

                ((!problemaPinza) ? 'Verifique el sensor y la configuración del monitor. ' : '');

    return resultado;

  }

  

  // Problemas específicos para desfibrilador

  const problemaDescarga = respuestas.find(r => r.pregunta.includes("¿El desfibrilador entrega descarga") && r.respuesta === 'No');

  const problemaSincronizacion = respuestas.find(r => r.pregunta.includes("¿El equipo está correctamente sincronizado") && r.respuesta === 'No');

  const problemaSenal = respuestas.find(r => r.pregunta.includes("¿El desfibrilador detecta señal cardíaca") && r.respuesta === 'No');

  

  if (problemaDescarga || problemaSincronizacion || problemaSenal) {

    resultado = 'Diagnóstico: Problema con el desfibrilador. ' + 

                (problemaSincronizacion ? 'El equipo no está correctamente sincronizado. ' : '') +

                (problemaSenal ? 'No detecta señal cardíaca, verifique electrodos y conexiones. ' : '') +

                ((!problemaSincronizacion && !problemaSenal) ? 'Verifique palas y conexiones internas. ' : '');

    return resultado;

  }

  

  // Problemas específicos para ECG

  const problemaECGSenal = respuestas.find(r => r.pregunta.includes("¿El equipo muestra interferencia en la señal") && r.respuesta === 'Sí');

  const problemaDepilar = respuestas.find(r => r.pregunta.includes("¿Se depiló la zona de contacto") && r.respuesta === 'No');

  const problemaMetalico = respuestas.find(r => r.pregunta.includes("¿El paciente está en contacto con algún elemento metálico") && r.respuesta === 'Sí');

  

  if (problemaECGSenal || problemaDepilar || problemaMetalico) {

    resultado = 'Diagnóstico: Problema con la señal del ECG. ' + 

                (problemaDepilar ? 'Se debe depilar la zona de contacto con los electrodos. ' : '') +

                (problemaMetalico ? 'El paciente está en contacto con elementos metálicos que interfieren con la señal. ' : '') +

                ((!problemaDepilar && !problemaMetalico) ? 'Verifique filtros y conexiones de cables. ' : '');

    return resultado;

  }

  

  // Problemas específicos para ventilador

  const problemaPresion = respuestas.find(r => r.pregunta.includes("¿La presión se ajusta correctamente") && r.respuesta === 'No');

  const problemaFlujo = respuestas.find(r => r.pregunta.includes("¿Hay problemas en los sensores de flujo") && r.respuesta === 'Sí');

  

  if (problemaPresion || problemaFlujo) {

    resultado = 'Diagnóstico: Problema con el ventilador. ' + 

                (problemaPresion ? 'La presión no se ajusta correctamente. ' : '') +

                (problemaFlujo ? 'Hay problemas en los sensores de flujo de la pieza de aire. ' : '') +

                ((!problemaPresion && !problemaFlujo) ? 'Verifique la conexión al paciente y configuración. ' : '');

    return resultado;

  }

  

  // Si no se identificó ningún problema específico pero hay preguntas con problemas

  resultado = 'Diagnóstico: Se detectaron varios problemas. Se recomienda una revisión técnica completa del equipo para identificar con precisión la causa del fallo.';

  return resultado;

}