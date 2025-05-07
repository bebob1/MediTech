// Importar modelos
const Equipo = require('../models/Equipo');
const Diagnostico = require('../models/Diagnostico');

// Definición de equipos y sus posibles fallas
const equipos = ["VentiladorMecanico", "MonitorSignosVitales", "BombaInfusion", "Desfibrilador", "Electrocardiógrafo"];

// Para cada equipo, definimos sus posibles fallas
const fallas_por_equipo = {
  VentiladorMecanico: [
    "Problema de alimentación eléctrica",
    "Batería defectuosa",
    "Problema en sensores de flujo",
    "Problema de configuración",
    "Conexión incorrecta al paciente"
  ],
  MonitorSignosVitales: [
    "Problema de alimentación eléctrica",
    "Sensores desconectados o defectuosos",
    "Problema con lectura de SpO2",
    "Interferencia en las señales",
    "Configuración incorrecta"
  ],
  BombaInfusion: [
    "Problema de alimentación eléctrica",
    "Aire en las líneas",
    "Problema mecánico del motor",
    "Bolsa de medicamento vacía o mal conectada",
    "Cánula mal posicionada"
  ],
  Desfibrilador: [
    "Problema de alimentación eléctrica",
    "Electrodos mal conectados",
    "Palas defectuosas",
    "Sincronización incorrecta",
    "Batería descargada"
  ],
  Electrocardiógrafo: [
    "Problema de alimentación eléctrica",
    "Interferencia en la señal",
    "Electrodos mal conectados",
    "Filtros mal configurados",
    "Cable defectuoso"
  ]
};

// Para cada falla, definimos la probabilidad de observar cada síntoma (probabilidad condicional P(síntoma|falla))
const sintomas_por_falla = {
  // Ventilador Mecánico
  "VentiladorMecanico-Problema de alimentación eléctrica": {
    "no_enciende": 0.95,
    "cable_desconectado": 0.70,
    "fusible_quemado": 0.30,
    "bateria_mal_instalada": 0.10,
    "presion_no_ajusta": 0.05,
    "alarmas_activadas": 0.20
  },
  "VentiladorMecanico-Batería defectuosa": {
    "no_enciende": 0.60,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.90,
    "presion_no_ajusta": 0.05,
    "alarmas_activadas": 0.20
  },
  "VentiladorMecanico-Problema en sensores de flujo": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.10,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "presion_no_ajusta": 0.85,
    "alarmas_activadas": 0.70
  },
  "VentiladorMecanico-Problema de configuración": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "presion_no_ajusta": 0.60,
    "alarmas_activadas": 0.40
  },
  "VentiladorMecanico-Conexión incorrecta al paciente": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.10,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "presion_no_ajusta": 0.80,
    "alarmas_activadas": 0.85
  },
  
  // Monitor de Signos Vitales
  "MonitorSignosVitales-Problema de alimentación eléctrica": {
    "no_enciende": 0.95,
    "cable_desconectado": 0.70,
    "fusible_quemado": 0.30,
    "bateria_mal_instalada": 0.10,
    "problema_spo2": 0.05,
    "interferencia_señal": 0.10
  },
  "MonitorSignosVitales-Sensores desconectados o defectuosos": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.60,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "problema_spo2": 0.80,
    "interferencia_señal": 0.70
  },
  "MonitorSignosVitales-Problema con lectura de SpO2": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "problema_spo2": 0.95,
    "interferencia_señal": 0.20
  },
  "MonitorSignosVitales-Interferencia en las señales": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.10,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "problema_spo2": 0.40,
    "interferencia_señal": 0.90
  },
  "MonitorSignosVitales-Configuración incorrecta": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "problema_spo2": 0.30,
    "interferencia_señal": 0.30
  },
  
  // Bomba de Infusión
  "BombaInfusion-Problema de alimentación eléctrica": {
    "no_enciende": 0.95,
    "cable_desconectado": 0.70,
    "fusible_quemado": 0.30,
    "bateria_mal_instalada": 0.10,
    "no_administra_medicamento": 0.70,
    "burbujas_lineas": 0.05
  },
  "BombaInfusion-Aire en las líneas": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_administra_medicamento": 0.70,
    "burbujas_lineas": 0.95
  },
  "BombaInfusion-Problema mecánico del motor": {
    "no_enciende": 0.30,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.20,
    "bateria_mal_instalada": 0.05,
    "no_administra_medicamento": 0.90,
    "burbujas_lineas": 0.05
  },
  "BombaInfusion-Bolsa de medicamento vacía o mal conectada": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_administra_medicamento": 0.90,
    "burbujas_lineas": 0.20
  },
  "BombaInfusion-Cánula mal posicionada": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_administra_medicamento": 0.80,
    "burbujas_lineas": 0.30
  },
  
  // Desfibrilador
  "Desfibrilador-Problema de alimentación eléctrica": {
    "no_enciende": 0.95,
    "cable_desconectado": 0.70,
    "fusible_quemado": 0.30,
    "bateria_mal_instalada": 0.10,
    "no_entrega_descarga": 0.80,
    "no_detecta_señal": 0.20
  },
  "Desfibrilador-Electrodos mal conectados": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.30,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_entrega_descarga": 0.50,
    "no_detecta_señal": 0.90
  },
  "Desfibrilador-Palas defectuosas": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.10,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_entrega_descarga": 0.90,
    "no_detecta_señal": 0.30
  },
  "Desfibrilador-Sincronización incorrecta": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "no_entrega_descarga": 0.70,
    "no_detecta_señal": 0.40
  },
  "Desfibrilador-Batería descargada": {
    "no_enciende": 0.70,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.10,
    "bateria_mal_instalada": 0.70,
    "no_entrega_descarga": 0.90,
    "no_detecta_señal": 0.30
  },
  
  // Electrocardiógrafo
  "Electrocardiógrafo-Problema de alimentación eléctrica": {
    "no_enciende": 0.95,
    "cable_desconectado": 0.70,
    "fusible_quemado": 0.30,
    "bateria_mal_instalada": 0.10,
    "interferencia_señal": 0.30,
    "electrodos_mal_puestos": 0.05
  },
  "Electrocardiógrafo-Interferencia en la señal": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.10,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "interferencia_señal": 0.95,
    "electrodos_mal_puestos": 0.40
  },
  "Electrocardiógrafo-Electrodos mal conectados": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.20,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "interferencia_señal": 0.80,
    "electrodos_mal_puestos": 0.95
  },
  "Electrocardiógrafo-Filtros mal configurados": {
    "no_enciende": 0.05,
    "cable_desconectado": 0.05,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "interferencia_señal": 0.70,
    "electrodos_mal_puestos": 0.10
  },
  "Electrocardiógrafo-Cable defectuoso": {
    "no_enciende": 0.20,
    "cable_desconectado": 0.60,
    "fusible_quemado": 0.05,
    "bateria_mal_instalada": 0.05,
    "interferencia_señal": 0.90,
    "electrodos_mal_puestos": 0.30
  }
};

// Mapa de síntomas para facilitar la traducción de preguntas a identificadores de síntomas
const mapaPreguntasASintomas = {
  "¿El equipo enciende correctamente?": { sintoma: "no_enciende", valorNegativo: true },
  "¿El cable de alimentación está bien conectado?": { sintoma: "cable_desconectado", valorNegativo: true },
  "¿El fusible está en buen estado?": { sintoma: "fusible_quemado", valorNegativo: true },
  "¿La batería está bien instalada?": { sintoma: "bateria_mal_instalada", valorNegativo: true },
  "¿La presión se ajusta correctamente?": { sintoma: "presion_no_ajusta", valorNegativo: true },
  "¿El equipo emite algún sonido anormal?": { sintoma: "alarmas_activadas", valorPositivo: true },
  "¿El monitor muestra problemas con la saturación de oxígeno (SpO2)?": { sintoma: "problema_spo2", valorPositivo: true },
  "¿El equipo muestra interferencia en la señal?": { sintoma: "interferencia_señal", valorPositivo: true },
  "¿La bomba administra el medicamento correctamente?": { sintoma: "no_administra_medicamento", valorNegativo: true },
  "¿Hay burbujas visibles en las líneas?": { sintoma: "burbujas_lineas", valorPositivo: true },
  "¿El desfibrilador entrega descarga?": { sintoma: "no_entrega_descarga", valorNegativo: true },
  "¿El desfibrilador detecta señal cardíaca?": { sintoma: "no_detecta_señal", valorNegativo: true },
  "¿Los electrodos están correctamente colocados?": { sintoma: "electrodos_mal_puestos", valorNegativo: true }
};

// Probabilidades a priori (prior) para cada falla - por defecto equiprobables
const probabilidades_priori = {};
for (const equipo of equipos) {
  const fallas = fallas_por_equipo[equipo];
  const probabilidadBase = 1.0 / fallas.length;
  
  for (const falla of fallas) {
    probabilidades_priori[`${equipo}-${falla}`] = probabilidadBase;
  }
}

/**
 * Traduce las respuestas del cuestionario a síntomas observados
 * @param {Array} respuestas - Array de objetos {pregunta, respuesta}
 * @returns {Object} - Mapa de síntomas observados (true/false)
 */
function traducirRespuestasASintomas(respuestas) {
  const sintomas = {};
  
  for (const respuesta of respuestas) {
    const mapeo = mapaPreguntasASintomas[respuesta.pregunta];
    if (mapeo) {
      if (mapeo.valorPositivo && respuesta.respuesta === 'Sí') {
        sintomas[mapeo.sintoma] = true;
      } else if (mapeo.valorNegativo && respuesta.respuesta === 'No') {
        sintomas[mapeo.sintoma] = true;
      }
    }
  }
  
  return sintomas;
}

/**
 * Calcula las probabilidades a posteriori de cada falla usando inferencia bayesiana
 * @param {string} tipoEquipo - Tipo de equipo médico
 * @param {Object} sintomasObservados - Mapa de síntomas observados
 * @returns {Array} - Lista de fallas ordenadas por probabilidad
 */
function calcularProbabilidadesPosterior(tipoEquipo, sintomasObservados) {
  const fallas = fallas_por_equipo[tipoEquipo];
  const resultados = [];
  
  // Factor de normalización (evidencia)
  let evidenciaTotal = 0;
  
  // Calcular verosimilitud para cada falla
  for (const falla of fallas) {
    const fallaKey = `${tipoEquipo}-${falla}`;
    const priorFalla = probabilidades_priori[fallaKey];
    
    // Probabilidad de los síntomas dada la falla: P(síntomas|falla)
    let verosimilitud = 1.0;
    
    // Para cada posible síntoma de esta falla
    const sintomasPosibles = sintomas_por_falla[fallaKey];
    
    for (const sintoma in sintomasPosibles) {
      const probSintomaGivenFalla = sintomasPosibles[sintoma];
      
      // Si el síntoma está presente
      if (sintomasObservados[sintoma]) {
        verosimilitud *= probSintomaGivenFalla;
      } else {
        // Si el síntoma no está presente (complemento)
        verosimilitud *= (1 - probSintomaGivenFalla);
      }
    }
    
    // Probabilidad no normalizada
    const probNoNormalizada = priorFalla * verosimilitud;
    evidenciaTotal += probNoNormalizada;
    
    resultados.push({
      falla: falla,
      probabilidad: probNoNormalizada
    });
  }
  
  // Normalizar resultados
  if (evidenciaTotal > 0) {
    for (const resultado of resultados) {
      resultado.probabilidad = resultado.probabilidad / evidenciaTotal;
    }
  }
  
  // Ordenar por probabilidad descendente
  resultados.sort((a, b) => b.probabilidad - a.probabilidad);
  
  return resultados;
}

/**
 * Obtiene los síntomas más característicos para una falla específica
 * @param {string} tipoEquipo - Tipo de equipo
 * @param {string} falla - Nombre de la falla
 * @returns {Array} - Lista de síntomas característicos para esa falla
 */
function obtenerSintomasParaFalla(tipoEquipo, falla) {
  const fallaKey = `${tipoEquipo}-${falla}`;
  const sintomas = sintomas_por_falla[fallaKey];
  
  // Obtener los síntomas con mayor probabilidad para esta falla
  const sintomasOrdenados = Object.entries(sintomas)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, prob]) => prob > 0.7) // Solo síntomas con alta probabilidad
    .slice(0, 3);  // Tomar hasta 3 síntomas más probables
  
  return sintomasOrdenados.map(([sintoma, prob]) => ({
    sintoma: sintoma,
    probabilidad: prob
  }));
}

/**
 * Función principal para realizar el diagnóstico basado en síntomas
 * @param {string} tipoEquipo - Tipo de equipo médico
 * @param {Array} respuestas - Array de respuestas del usuario
 * @returns {Object} - Resultado del diagnóstico
 */
function diagnosticarBayesiano(tipoEquipo, respuestas) {
  // Traducir respuestas a síntomas observados
  const sintomasObservados = traducirRespuestasASintomas(respuestas);
  
  // Calcular probabilidades de cada falla dado los síntomas
  const resultados = calcularProbabilidadesPosterior(tipoEquipo, sintomasObservados);
  
  // Obtener las 5 fallas más probables
  const principalesFallas = resultados.slice(0, 5);
  
  // Preparar información detallada para el diagnóstico
  let diagnosticoDetallado = "Basado en los síntomas reportados, se han identificado las siguientes posibles fallas:\n\n";
  
  // Mapeo de códigos de síntomas a descripciones legibles
  const sintomasDescripcion = {
    "no_enciende": "equipo no enciende",
    "cable_desconectado": "cable desconectado",
    "fusible_quemado": "fusible quemado",
    "bateria_mal_instalada": "batería mal instalada",
    "presion_no_ajusta": "presión no se ajusta correctamente",
    "alarmas_activadas": "alarmas activadas",
    "problema_spo2": "problemas con la lectura de SpO2",
    "interferencia_señal": "interferencia en la señal",
    "no_administra_medicamento": "no administra medicamento",
    "burbujas_lineas": "burbujas en las líneas",
    "no_entrega_descarga": "no entrega descarga",
    "no_detecta_señal": "no detecta señal cardíaca",
    "electrodos_mal_puestos": "electrodos mal colocados"
  };
  
  // Para cada falla principal, agregamos la falla seguida de sus síntomas característicos
  principalesFallas.forEach((resultado, index) => {
    const porcentaje = (resultado.probabilidad * 100).toFixed(2);
    const falla = resultado.falla;
    
    // Agregar la falla con su probabilidad
    diagnosticoDetallado += `${index + 1}. ${falla}: ${porcentaje}%\n`;
    
    // Obtener y agregar los síntomas característicos de esta falla específica
    const sintomasFalla = obtenerSintomasParaFalla(tipoEquipo, falla);
    
    if (sintomasFalla.length > 0) {
      diagnosticoDetallado += "   Síntomas a verificar:\n";
      
      sintomasFalla.forEach(item => {
        const descripcionSintoma = sintomasDescripcion[item.sintoma] || item.sintoma;
        diagnosticoDetallado += `   - Verificar ${descripcionSintoma}\n`;
      });
    }
    
    // Agregar espacio entre fallas para mejor legibilidad
    diagnosticoDetallado += "\n";
  });
  
  // Añadir recomendación basada en la falla más probable
  const fallaPrincipal = principalesFallas[0].falla;
  diagnosticoDetallado += `Recomendación principal: Se debe verificar ${fallaPrincipal.toLowerCase()}.\n`;
  
  return {
    fallasProbables: principalesFallas,
    diagnosticoDetallado: diagnosticoDetallado
  };
}

// Esta función reemplazaría la función determinarDiagnostico en tu controlador
function determinarDiagnosticoBayesiano(tipoEquipo, respuestas) {
  const resultado = diagnosticarBayesiano(tipoEquipo, respuestas);
  return resultado.diagnosticoDetallado;
}

// Modificación para el controlador
exports.procesarDiagnosticoBayesiano = async (req, res) => {
  try {
    const { equipoId, respuestas } = req.body;
    const userId = req.session.userId;
    
    if (!userId || !equipoId || !respuestas) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos' 
      });
    }
    
    // Obtener el tipo de equipo a partir del ID
    const equipo = await Equipo.getById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }
    
    // Mapear el nombre del equipo al tipo de equipo en nuestro modelo bayesiano
    let tipoEquipo;
    if (equipo.nombre.includes("Ventilador")) {
      tipoEquipo = "VentiladorMecanico";
    } else if (equipo.nombre.includes("Monitor")) {
      tipoEquipo = "MonitorSignosVitales";
    } else if (equipo.nombre.includes("Bomba")) {
      tipoEquipo = "BombaInfusion";
    } else if (equipo.nombre.includes("Desfibrilador")) {
      tipoEquipo = "Desfibrilador";
    } else if (equipo.nombre.includes("Electrocardiógrafo") || equipo.nombre.includes("Electrocardiografo")) {
      tipoEquipo = "Electrocardiógrafo";
    } else {
      // Si no coincide, usamos un valor por defecto
      tipoEquipo = "MonitorSignosVitales";
    }
    
    // Aplicamos la lógica bayesiana para determinar el diagnóstico
    const diagnosticoResultado = determinarDiagnosticoBayesiano(tipoEquipo, respuestas);
    
    // Guardamos el diagnóstico en la base de datos
    const fechaDiagnostico = new Date();
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
        diagnostico: diagnosticoResultado, // Usa el mismo nombre que espera el frontend
        diagnosticoId: diagnosticoId
      });
  } catch (error) {
    console.error('Error al procesar diagnóstico bayesiano:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el diagnóstico: ' + error.message 
    });
  }
};