const express = require("express");
const router = express.Router();
const db = require('../database/db');

const rutinaClienteController = require("../controllers/rutinaClienteController");
const verifyToken = require("../middleware/auth")

/**
 * @route GET /api/mis-rutinas/:id_usuario/all
 * @name Obtener Todas las Rutinas de Lectura del Cliente
 * @memberof module:routes/rutinaCliente
 * @description Obtiene la lista de rutinas activas de un cliente con sus registros de lectura (series, repeticiones, carga, RPE).
 * Construye un JSON anidado agrupando lecturas por categorías y ejercicios. Filtra rutinas sin registros de lectura.
 * 
 * @access Private (Cliente)
 * 
 * @param {number} id_usuario - ID del usuario cliente.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos JSON con la estructura de rutinas y lecturas.
 * @returns {Object} 404 - Not Found. El usuario no tiene rutinas con lecturas registradas.
 * @returns {Object} 500 - Error interno. Fallo en la agregación JSON o consulta SQL.
 */
router.get("/:id_usuario/all", verifyToken, (req, res, next) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_historial', h.id,
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'lecturas', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', l2.id_ejercicio,
                                'repeticiones', l2.repeticiones,
                                'series', l2.series,
                                'carga', l2.carga,
                                'RPE', l2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM lectura l2
                        INNER JOIN ejercicio e2 ON l2.id_ejercicio = e2.id
                        WHERE l2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM lectura l3
                INNER JOIN ejercicio e3 ON l3.id_ejercicio = e3.id
                WHERE l3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id_usuario = ?
      AND EXISTS (SELECT 1 FROM lectura l WHERE l.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_usuario], (err, results) => {
        if (err) return next(err);
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutinas no encontradas" });
        }
        res.json(results);
    });
});

/**
 * @route GET /api/mis-rutinas/id-historial/:id_usuario/:id_plantilla
 * @name Obtener ID de Historial por Usuario y Plantilla
 * @memberof module:routes/rutinaCliente
 * @description Recupera el ID de historial específico cruzando los datos de usuario y plantilla.
 * Útil para obtener la referencia interna antes de realizar operaciones de lectura/escritura.
 * 
 * @access Private (Cliente)
 * 
 * @param {number} id_usuario - ID del usuario cliente.
 * @param {number} id_plantilla - ID de la plantilla base.
 * 
 * @returns {Object} 200 - Éxito. Array con el objeto { id } del historial encontrado.
 * @returns {Object} 404 - Not Found. No existe tal asignación (array vacío).
 * @returns {Object} 500 - Error interno. Fallo en la consulta de búsqueda.
 */
router.get("/id-historial/:id_usuario/:id_plantilla", verifyToken, (req, res, next) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    const id_plantilla = parseInt(req.params.id_plantilla, 10)
    db.query('SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla= ?', [id_usuario, id_plantilla], (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
})

/**
 * @route GET /api/mis-rutinas/:id_historial
 * @name Obtener Detalle de Rutina de Cliente por Historial
 * @memberof module:routes/rutinaCliente
 * @description Obtiene la estructura completa de una rutina específica con los datos de lectura actuales.
 * Devuelve un objeto JSON único (no un array) con bloques, categorías y ejercicios rellenados.
 * 
 * @access Private (Cliente)
 * 
 * @param {number} id_historial - ID del registro de historial de la rutina.
 * 
 * @returns {Object} 200 - Éxito. Objeto JSON con la estructura de la rutina y sus lecturas.
 * @returns {Object} 404 - Not Found. La rutina no existe o no tiene lecturas registradas.
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL o agregación JSON.
 */
router.get("/:id_historial", verifyToken, (req, res, next) => {
    const id_historial = parseInt(req.params.id_historial, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_historial', h.id,
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'lecturas', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', l2.id_ejercicio,
                                'repeticiones', l2.repeticiones,
                                'series', l2.series,
                                'carga', l2.carga,
                                'RPE', l2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM lectura l2
                        INNER JOIN ejercicio e2 ON l2.id_ejercicio = e2.id
                        WHERE l2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM lectura l3
                INNER JOIN ejercicio e3 ON l3.id_ejercicio = e3.id
                WHERE l3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id = ?
      AND EXISTS (SELECT 1 FROM lectura l WHERE l.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_historial], (err, results) => {
        if (err) return next(err);
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }
        res.json(results[0].result);
    });
});

/**
 * @route PUT /api/mis-rutinas/:id_usuario/:id_historial
 * @name Actualizar Lecturas de Rutina de Cliente
 * @memberof module:routes/rutinaCliente
 * @description Ejecuta el controlador para actualizar los valores de series, repeticiones, carga y RPE
 * de los ejercicios de una rutina específica. Valida la propiedad del usuario sobre la rutina.
 * 
 * @access Private (Cliente)
 * 
 * @param {number} id_usuario - ID del usuario cliente (validación de propiedad).
 * @param {number} id_historial - ID del historial de la rutina a actualizar.
 * @param {Object} req.body - Cuerpo con los nuevos datos de lecturas/bloques.
 * 
 * @returns {Object} 200 - Éxito. Lecturas actualizadas o mensaje de "sin cambios".
 * @returns {Object} 400 - Bad Request. Error de validación en los datos de entrada.
 * @returns {Object} 404 - Not Found. Rutina no encontrada.
 * @returns {Object} 500 - Error interno. Fallo en la base de datos.
 */
router.put("/:id_usuario/:id_historial", verifyToken, rutinaClienteController.updateRutinaClienteControl);

module.exports = router;