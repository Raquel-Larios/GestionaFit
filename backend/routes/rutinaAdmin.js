const express = require("express");
const router = express.Router();
const db = require('../database/db');

const rutinaAdminController = require("../controllers/rutinaAdminController");

/**
 * @route GET /api/rutinas/all/:id_usuario
 * @name Obtener Rutinas Asignadas por Usuario
 * @memberof module:routes/rutinaAdmin
 * @description Obtiene la lista de rutinas asignadas a un usuario con su estructura completa anidada en JSON.
 * Construye dinámicamente la jerarquía (Rutina -> Bloques -> Variaciones) mediante agregación SQL nativa.
 * Normaliza el ID de usuario a entero para seguridad de tipos.
 * 
 * @access Private (Requiere autenticación de Admin/Usuario)
 * 
 * @param {number} id_usuario - ID del usuario propietario de las rutinas.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos JSON con la estructura de la rutina.
 * @returns {Object} 404 - Not Found. El usuario no tiene rutinas asignadas o están vacías.
 * @returns {Object} 500 - Error interno. Fallo en la consulta de agregación JSON.
 */
router.get("/all/:id_usuario", (req, res, next) => {
    // 1. Normalización del ID de usuario
    const id_usuario = parseInt(req.params.id_usuario, 10);

    // 2. Consulta de agregación JSON anidada
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
                    'variaciones', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', v2.id_ejercicio,
                                'repeticiones', v2.repeticiones,
                                'series', v2.series,
                                'carga', v2.carga,
                                'RPE', v2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM variacion v2
                        INNER JOIN ejercicio e2 ON v2.id_ejercicio = e2.id
                        WHERE v2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM variacion v3
                INNER JOIN ejercicio e3 ON v3.id_ejercicio = e3.id
                WHERE v3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id_usuario = ?
      AND EXISTS (SELECT 1 FROM variacion v WHERE v.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    // 3. Ejecución y manejo de errores estándar de ruta
    db.query(query, [id_usuario], (err, results) => {
        if (err) return next(err); // Pasa el error al middleware global
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutinas no encontradas" });
        }
        res.json(results);
    });
});

/**
 * @route GET /api/rutinas/id-historial/:id_usuario/:id_plantilla
 * @name Obtener ID de Historial por Usuario y Plantilla
 * @memberof module:routes/rutinaAdmin
 * @description Verifica la existencia de una asignación específica buscando el ID de historial
 * mediante la combinación única de ID de usuario y ID de plantilla.
 * 
 * @access Private
 * 
 * @param {number} id_usuario - ID del usuario.
 * @param {number} id_plantilla - ID de la plantilla.
 * 
 * @returns {Object} 200 - Éxito. Array con el ID de historial encontrado (vacío si no existe).
 * @returns {Object} 500 - Error interno. Fallo en la consulta de verificación.
 */
router.get("/id-historial/:id_usuario/:id_plantilla", (req, res, next) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    const id_plantilla = parseInt(req.params.id_plantilla, 10)
    db.query('SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla= ?', [id_usuario, id_plantilla], (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
})

/**
 * @route GET /api/rutinas/:id_historial
 * @name Obtener Detalle de Rutina por Historial
 * @memberof module:routes/rutinaAdmin
 * @description Obtiene la estructura completa de una rutina asignada específica.
 * Construye un objeto JSON anidado con bloques, categorías y variaciones de ejercicios.
 * Filtra rutinas vacías y devuelve el objeto JSON directo en lugar del array envoltorio.
 * 
 * @access Private
 * 
 * @param {number} id_historial - ID del registro de historial de la rutina.
 * 
 * @returns {Object} 200 - Éxito. Objeto JSON con la estructura completa de la rutina.
 * @returns {Object} 404 - Not Found. La rutina no existe o no tiene ejercicios.
 * @returns {Object} 500 - Error interno. Fallo en la agregación JSON.
 */
router.get("/:id_historial", (req, res, next) => {
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
                    'variaciones', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', v2.id_ejercicio,
                                'repeticiones', v2.repeticiones,
                                'series', v2.series,
                                'carga', v2.carga,
                                'RPE', v2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM variacion v2
                        INNER JOIN ejercicio e2 ON v2.id_ejercicio = e2.id
                        WHERE v2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM variacion v3
                INNER JOIN ejercicio e3 ON v3.id_ejercicio = e3.id
                WHERE v3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id = ?
      AND EXISTS (SELECT 1 FROM variacion v WHERE v.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_historial], (err, results) => {
        if (err) return next(err);
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }
        // Se devuelve el objeto JSON contenido en 'result', no el array completo
        res.json(results[0].result);
    });
});

/**
 * @route GET /api/rutinas/asignaciones/por-plantilla/:id_plantilla
 * @name Listar Usuarios con Plantilla Asignada
 * @memberof module:routes/rutinaAdmin
 * @description Obtiene la lista de usuarios que tienen asignada una plantilla específica.
 * Realiza un JOIN con la tabla de usuarios para obtener nombres y apellidos.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_plantilla - ID de la plantilla a consultar.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos { id_usuario, nombre, apellidos }.
 * @returns {Object} 500 - Error interno. Fallo en el JOIN o consulta.
 */
router.get("/asignaciones/por-plantilla/:id_plantilla", (req, res, next) => {
    const id_plantilla = parseInt(req.params.id_plantilla, 10);

    db.query("SELECT h.id_usuario, u.nombre, u.apellidos FROM historial_plantilla_usuario as h INNER JOIN usuario as u ON u.id = h.id_usuario WHERE h.id_plantilla = ?",
        [id_plantilla], 
        (err, results) => {
        if (err) return next(err);
        res.json(results);
    });

});

/**
 * @route GET /api/rutinas/asignaciones/por-usuario/:id_usuario
 * @name Listar Plantillas Asignadas a Usuario
 * @memberof module:routes/rutinaAdmin
 * @description Obtiene la lista de plantillas asignadas a un usuario específico.
 * Recupera los IDs de historial y plantilla junto con el nombre de la plantilla.
 * 
 * @access Private
 * 
 * @param {number} id_usuario - ID del usuario a consultar.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos { id_plantilla, nombre_plantilla, id_usuario }.
 * @returns {Object} 500 - Error interno. Fallo en el JOIN o consulta.
 */
router.get("/asignaciones/por-usuario/:id_usuario", (req, res, next) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);

    db.query("SELECT h.id_plantilla, p.nombre_plantilla, h.id_usuario FROM historial_plantilla_usuario as h INNER JOIN plantilla as p ON p.id = h.id_plantilla WHERE h.id_usuario = ?",
        [id_usuario], 
        (err, results) => {
        if (err) return next(err);
        res.json(results);
    });

});

/**
 * @route POST /api/rutinas/:id_usuario/:id_plantilla
 * @name Asignar Plantilla a Usuario
 * @memberof module:routes/rutinaAdmin
 * @description Ejecuta el controlador para crear una nueva rutina asignando una plantilla a un usuario.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_usuario - ID del usuario destinatario.
 * @param {number} id_plantilla - ID de la plantilla a asignar.
 * 
 * @returns {Object} 200 - Éxito. Rutina creada.
 * @returns {Object} 400 - Bad Request. Validación fallida o duplicidad.
 * @returns {Object} 500 - Error interno.
 */
router.post("/:id_usuario/:id_plantilla", rutinaAdminController.createRutinaAdminControl);

/**
 * @route PUT /api/rutinas/:id_historial
 * @name Actualizar Rutina Asignada
 * @memberof module:routes/rutinaAdmin
 * @description Ejecuta el controlador para actualizar los bloques y variaciones de una rutina existente.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_historial - ID del historial de la rutina a actualizar.
 * 
 * @returns {Object} 200 - Éxito. Rutina actualizada.
 * @returns {Object} 400 - Bad Request. Validación fallida.
 * @returns {Object} 404 - Not Found. Rutina no encontrada.
 * @returns {Object} 500 - Error interno.
 */
router.put("/:id_historial", rutinaAdminController.updateRutinaAdminControl);

/**
 * @route DELETE /api/rutinas/:id_historial
 * @name Eliminar Rutina Asignada
 * @memberof module:routes/rutinaAdmin
 * @description Ejecuta el controlador para eliminar una asignación de rutina y sus datos asociados.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_historial - ID del historial de la rutina a eliminar.
 * 
 * @returns {Object} 200 - Éxito. Rutina eliminada.
 * @returns {Object} 404 - Not Found. Rutina no encontrada (o ya eliminada).
 * @returns {Object} 500 - Error interno.
 */
router.delete("/:id_historial", rutinaAdminController.deleteRutinaAdminControl);

module.exports = router;