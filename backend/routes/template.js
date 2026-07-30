const express = require("express");
const router = express.Router();
const db = require("../database/db");

const templateController = require("../controllers/templateController");
const verifyToken = require("../middleware/auth")

/**
 * @route GET /api/plantillas/all
 * @name Obtener Todas las Plantillas
 * @memberof module:routes/template
 * @description Obtiene la lista completa de plantillas disponibles con su estructura de bloques y ejercicios por defecto.
 * Permite ordenar por antigüedad (ID descendente) o por nombre (alfabético) mediante query param.
 * Construye un JSON anidado: Plantilla -> Bloques (Categorías) -> Defectos (Ejercicios).
 * 
 * @access Private (Admin)
 * 
 * @param {string} [req.query.by_antiguedad] - Si está presente, ordena por ID DESC. Si no, por nombre ASC.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos JSON con la estructura de las plantillas.
 * @returns {Object} 500 - Error interno. Fallo en la construcción de la consulta dinámica o agregación JSON.
 */
router.get("/all", verifyToken, (req, res, next) => {
    const { by_antiguedad } = req.query;

    // 1. Construcción base de la consulta con agregación JSON
    let query = `SELECT 
    JSON_OBJECT(
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'defectos', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', d2.id_ejercicio,
                                'repeticiones', d2.repeticiones,
                                'series', d2.series,
                                'carga', d2.carga,
                                'RPE', d2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM defecto d2
                        INNER JOIN ejercicio e2 ON d2.id_ejercicio = e2.id
                        WHERE d2.id_plantilla = p.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM defecto d3
                INNER JOIN ejercicio e3 ON d3.id_ejercicio = e3.id
                WHERE d3.id_plantilla = p.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM plantilla p
    WHERE EXISTS (SELECT 1 FROM defecto d WHERE d.id_plantilla = p.id)
    GROUP BY p.id, p.nombre_plantilla
                    ORDER BY `;

    // 2. Ordenamiento dinámico seguro (Solo se concatena el campo, no valores de usuario)
    if (by_antiguedad) {
        query += "p.id DESC;";
    } else {
        query += "p.nombre_plantilla ASC;";
    }

    // 3. Ejecución y manejo de errores
    db.query(query, (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route GET /api/plantillas/:id_plantilla
 * @name Obtener Detalle de Plantilla por ID
 * @memberof module:routes/template
 * @description Obtiene la estructura completa de una plantilla específica identificada por su ID.
 * Devuelve un objeto JSON único (no un array) con bloques, categorías y ejercicios por defecto.
 * Filtra plantillas vacías (sin ejercicios).
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_plantilla - ID de la plantilla a consultar.
 * 
 * @returns {Object} 200 - Éxito. Objeto JSON con la estructura completa de la plantilla.
 * @returns {Object} 404 - Not Found. La plantilla no existe o está vacía.
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL o agregación JSON.
 */
router.get("/:id_plantilla", verifyToken, (req, res, next) => {
    const id_plantilla = parseInt(req.params.id_plantilla, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'defectos', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', d2.id_ejercicio,
                                'repeticiones', d2.repeticiones,
                                'series', d2.series,
                                'carga', d2.carga,
                                'RPE', d2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM defecto d2
                        INNER JOIN ejercicio e2 ON d2.id_ejercicio = e2.id
                        WHERE d2.id_plantilla = p.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM defecto d3
                INNER JOIN ejercicio e3 ON d3.id_ejercicio = e3.id
                WHERE d3.id_plantilla = p.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM plantilla p
    WHERE p.id = ?
      AND EXISTS (SELECT 1 FROM defecto d WHERE d.id_plantilla = p.id)
    GROUP BY p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_plantilla], (err, results) => {
        if (err) return next (err);
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Plantilla no encontrada" });
        }
        res.json(results[0].result);
    });
});

/**
 * @route POST /api/plantillas
 * @name Crear Nueva Plantilla
 * @memberof module:routes/template
 * @description Ejecuta el controlador para crear una nueva plantilla con sus ejercicios por defecto.
 * 
 * @access Private (Admin)
 * 
 * @param {Object} req.body - Cuerpo con nombre_plantilla y bloques de ejercicios.
 * 
 * @returns {Object} 200 - Éxito. Plantilla creada.
 * @returns {Object} 400 - Bad Request. Validación fallida o nombre duplicado.
 * @returns {Object} 500 - Error interno.
 */
router.post("", verifyToken, templateController.createTemplateControl);

/**
 * @route PUT /api/plantillas/:id_plantilla
 * @name Actualizar Plantilla Existente
 * @memberof module:routes/template
 * @description Ejecuta el controlador para actualizar el nombre y/o los ejercicios de una plantilla.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_plantilla - ID de la plantilla a actualizar.
 * @param {Object} req.body - Cuerpo con nombre_plantilla y bloques actualizados.
 * 
 * @returns {Object} 200 - Éxito. Plantilla actualizada.
 * @returns {Object} 400 - Bad Request. Validación fallida o conflicto de nombres.
 * @returns {Object} 404 - Not Found. Plantilla no encontrada.
 * @returns {Object} 500 - Error interno.
 */
router.put("/:id_plantilla", verifyToken, templateController.updateTemplateControl);

/**
 * @route DELETE /api/plantillas/:id_plantilla
 * @name Eliminar Plantilla
 * @memberof module:routes/template
 * @description Ejecuta el controlador para eliminar una plantilla y todos sus ejercicios por defecto asociados.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_plantilla - ID de la plantilla a eliminar.
 * 
 * @returns {Object} 200 - Éxito. Plantilla eliminada.
 * @returns {Object} 404 - Not Found. Plantilla no encontrada.
 * @returns {Object} 500 - Error interno.
 */
router.delete("/:id_plantilla", verifyToken, templateController.deleteTemplateControl);

/**
 * @route DELETE /api/plantillas/:id_usuario/:id_plantilla
 * @name Desvincular Plantilla de Usuario
 * @memberof module:routes/template
 * @description Ejecuta el controlador para eliminar la asignación de una plantilla a un usuario específico
 * (elimina el historial de rutina asociado) sin borrar la plantilla base.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_usuario - ID del usuario afectado.
 * @param {number} id_plantilla - ID de la plantilla a desvincular.
 * 
 * @returns {Object} 200 - Éxito. Asignación eliminada.
 * @returns {Object} 404 - Not Found. No existe tal asignación.
 * @returns {Object} 500 - Error interno.
 */
router.delete("/:id_usuario/:id_plantilla", verifyToken, templateController.deleteRutinaPlantillaControl);

module.exports = router;
