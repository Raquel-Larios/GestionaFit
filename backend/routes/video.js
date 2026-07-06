const express = require("express");
const router = express.Router();
const db = require('../database/db');

const videoController = require("../controllers/videoController");

/**
 * @route GET /api/videos/all
 * @name Listar Todos los Videos
 * @memberof module:routes/video
 * @description Obtiene la lista completa de videos demostrativos.
 * Permite ordenar dinámicamente por nombre (ascendente) o por ID (descendente, más recientes primero).
 * 
 * @access Public (o Private según configuración)
 * 
 * @param {string} [req.query.by_nombre] - Si está presente, ordena por nombre ASC. Si no, por ID DESC.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos video.
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL dinámica.
 */
router.get("/all", (req, res, next) => {
    const { by_nombre } = req.query;

    // 1. Construcción base de la consulta con ordenamiento dinámico seguro
    let query = 'SELECT id, nombre_video, enlace_video FROM video ORDER BY ';
  
    if (by_nombre) {
        query += 'nombre_video ASC';
    } else {
        query += 'id DESC';
    }

    // 2. Ejecución y manejo de errores
    db.query(query, (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route GET /api/videos/:id_video
 * @name Obtener Video por ID
 * @memberof module:routes/video
 * @description Obtiene los detalles de un video específico identificado por su ID.
 * 
 * @access Private
 * 
 * @param {number} id_video - ID del video a consultar.
 * 
 * @returns {Object} 200 - Éxito. Array con los datos del video (vacío si no existe).
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL.
 */
router.get("/:id_video", (req, res, next) => {
    const id_video = parseInt(req.params.id_video, 10);
    db.query('SELECT id, nombre_video, enlace_video FROM video WHERE id = ?', [id_video], (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route POST /api/videos
 * @name Crear Nuevo Video
 * @memberof module:routes/video
 * @description Ejecuta el controlador para crear un nuevo video demostrativo.
 * Valida unicidad de nombre y enlace.
 * 
 * @access Private (Admin)
 * 
 * @param {Object} req.body - Cuerpo con nombre_video y enlace_video.
 * 
 * @returns {Object} 200 - Éxito. Video creado.
 * @returns {Object} 400 - Bad Request. Validación fallida o duplicidad.
 * @returns {Object} 500 - Error interno.
 */
router.post("", videoController.createVideoControl);

/**
 * @route PUT /api/videos/:id_video
 * @name Actualizar Video Existente
 * @memberof module:routes/video
 * @description Ejecuta el controlador para actualizar los datos de un video.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_video - ID del video a actualizar.
 * @param {Object} req.body - Cuerpo con los nuevos datos.
 * 
 * @returns {Object} 200 - Éxito. Video actualizado.
 * @returns {Object} 400 - Bad Request. Validación fallida o duplicidad.
 * @returns {Object} 404 - Not Found. Video no encontrado.
 * @returns {Object} 500 - Error interno.
 */
router.put("/:id_video", videoController.updateVideoControl);

/**
 * @route DELETE /api/videos/:id_video
 * @name Eliminar Video
 * @memberof module:routes/video
 * @description Ejecuta el controlador para eliminar un video y sus asignaciones asociadas.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_video - ID del video a eliminar.
 * 
 * @returns {Object} 200 - Éxito. Video eliminado.
 * @returns {Object} 404 - Not Found. Video no encontrado.
 * @returns {Object} 500 - Error interno.
 */
router.delete("/:id_video", videoController.deleteVideoControl);

//GESTIÓN ASIGNACIÓN VIDEO-EJERCICIO

/**
 * @route GET /api/videos/asignacion-video-ejercicio
 * @name Listar Todas las Asignaciones
 * @memberof module:routes/video
 * @description Obtiene un listado crudo de todas las relaciones en la tabla 'demostracion'.
 * Devuelve solo las columnas id_ejercicio e id_video.
 * 
 * @access Private (Admin)
 * 
 * @returns {Object} 200 - Éxito. Array de objetos de asignación.
 * @returns {Object} 500 - Error interno. Fallo en la consulta.
 */
router.get("/asignacion-video-ejercicio", (req, res, next) => {
    db.query('SELECT * FROM demostracion', (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route GET /api/videos/asignacion-video-ejercicio/:id_video
 * @name Obtener Ejercicios de un Video
 * @memberof module:routes/video
 * @description Obtiene la lista de ejercicios asociados a un video específico.
 * Realiza un JOIN con la tabla 'ejercicio' para devolver los nombres legibles.
 * Ordena los resultados alfabéticamente por nombre de ejercicio.
 * 
 * @access Private
 * 
 * @param {number} id_video - ID del video a consultar.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos { id_ejercicio, nombre_ejercicio }.
 * @returns {Object} 500 - Error interno. Fallo en el JOIN o consulta.
 */
router.get("/asignacion-video-ejercicio/:id_video", (req, res, next) => {
    const id_video = parseInt(req.params.id_video, 10);
    db.query('SELECT demostracion.id_ejercicio, ejercicio.nombre_ejercicio FROM demostracion INNER JOIN ejercicio ON demostracion.id_ejercicio = ejercicio.id WHERE demostracion.id_video = ? ORDER BY ejercicio.nombre_ejercicio', [id_video], (err, results) => {
        if (err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/videos/asignar/:id_video/:id_ejercicio
 * @name Asignar Video a Ejercicio
 * @memberof module:routes/video
 * @description Ejecuta el controlador para vincular un video a un ejercicio.
 * Maneja la lógica de reemplazo si el video ya tiene un dueño (forceReplace).
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_video - ID del video.
 * @param {number} id_ejercicio - ID del ejercicio.
 * @param {Object} [req.body] - Opcionalmente { forceReplace: true }.
 * 
 * @returns {Object} 200 - Éxito. Asignación creada.
 * @returns {Object} 409 - Conflict. El video ya está asignado (si no se fuerza).
 * @returns {Object} 500 - Error interno.
 */
router.post("/asignar/:id_video/:id_ejercicio", videoController.linkVideoToExerciseControl);

/**
 * @route DELETE /api/videos/desasignar/:id_video
 * @name Desvincular Video de Ejercicio
 * @memberof module:routes/video
 * @description Ejecuta el controlador para eliminar la asignación de un video.
 * Libera el video para que pueda ser asignado a otro ejercicio.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_video - ID del video a desvincular.
 * 
 * @returns {Object} 200 - Éxito. Asignación eliminada.
 * @returns {Object} 404 - Not Found. No existía tal asignación.
 * @returns {Object} 500 - Error interno.
 */
router.delete("/desasignar/:id_video", videoController.unlinkVideoFromExerciseControl);

module.exports = router;