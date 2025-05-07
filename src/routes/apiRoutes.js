const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta para consultar verificaciones desde la base de datos
router.post('/verificaciones', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { fallas, equipoId } = req.body;
    
    if (!fallas || !Array.isArray(fallas) || !equipoId) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    
    // Array para almacenar los resultados
    const resultados = [];
    
    // Por cada falla, buscar hipótesis relacionadas en la base de datos
    for (const falla of fallas) {
      // Buscar hipótesis por descripción similar
      const [hipotesis] = await db.query(
        `SELECT id_hipotesis, descripcion 
         FROM hipotesis 
         WHERE id_equipo = ? AND descripcion LIKE ?`,
        [equipoId, `%${falla}%`]
      );
      
      // Si encontramos una hipótesis relacionada
      if (hipotesis && hipotesis.length > 0) {
        for (const hip of hipotesis) {
          // Obtener condiciones asociadas a la hipótesis
          const [condiciones] = await db.query(
            `SELECT descripcion 
             FROM condiciones 
             WHERE id_hipotesis = ?`,
            [hip.id_hipotesis]
          );
          
          // Obtener conclusión asociada a la hipótesis
          const [conclusiones] = await db.query(
            `SELECT descripcion 
             FROM conclusiones 
             WHERE id_hipotesis = ?`,
            [hip.id_hipotesis]
          );
          
          // Agregar al resultado
          resultados.push({
            hipotesis: hip.descripcion,
            condiciones: condiciones.map(c => c.descripcion),
            conclusion: conclusiones.length > 0 ? conclusiones[0].descripcion : 'No hay acción específica recomendada'
          });
        }
      }
    }
    
    res.json(resultados);
  } catch (error) {
    console.error('Error al consultar verificaciones:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

module.exports = router;