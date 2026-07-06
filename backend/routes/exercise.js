const express = require("express");
const router = express.Router();
const db = require('../database/db');
const exerciseController = require("../controllers/exerciseController");
const categoryController = require("../controllers/categoryController");
const videoController = require("../controllers/videoController");

// ==========================================================
// GESTIÓN DE EJERCICIOS (CRUD)
// ==========================================================

/**
 * @route GET /api/ejercicios/all
 * @name Listar Todos los Ejercicios
 * @memberof module:routes/exercise
 * @description Endpoint flexible que lista ejercicios.
 * Si se incluye el query param 'by_categoria', realiza un JOIN para incluir el nombre de la categoría.
 * 
 * @access Public
 * 
 * @query {string} [by_categoria] - Si está presente ("true"), incluye detalles de categoría.
 * 
 * @returns {Object} 200 - Éxito. Array de ejercicios.
 * @returns {Object} 500 - Error interno del servidor.
 * 
 * @example {json} Respuesta-200 (con by_categoria)
 * [
 *   { "id": 1, "nombre_ejercicio": "Sentadilla", "nombre_categoria": "Pierna" }
 * ]
 */
router.get("/all", (req, res, next) => {
  const { by_categoria } = req.query;

  // Construcción dinámica de la consulta: Base común
  let query = 'SELECT ejercicio.id, nombre_ejercicio';
  
  if (by_categoria) {
    // Si se solicita, se añade el JOIN y se maneja el ordenamiento de nulos al final
    query += ', ejercicio.id_categoria, nombre_categoria FROM ejercicio LEFT JOIN categoria ON ejercicio.id_categoria = categoria.id ORDER BY nombre_categoria IS NULL, nombre_categoria, nombre_ejercicio ASC';
  } else {
    // Consulta ligera sin JOIN para listados rápidos
    query += ', id_categoria FROM ejercicio ORDER BY nombre_ejercicio ASC';
  }

  db.query(query, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

/**
 * @route GET /api/ejercicios/:id_ejercicio
 * @name Obtener Ejercicio por ID
 * @memberof module:routes/exercise
 * @description Obtiene los detalles de un ejercicio específico.
 * Normaliza el ID a entero para seguridad.
 * 
 * @access Public
 * 
 * @param {number} id_ejercicio - ID del ejercicio.
 * 
 * @returns {Object} 200 - Éxito. Array con datos del ejercicio.
 * @returns {Object} 400 - Bad Request. ID inválido.
 * @returns {Object} 500 - Error interno.
 */
router.get("/:id_ejercicio", (req, res, next) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT id, nombre_ejercicio, id_categoria FROM ejercicio WHERE id = ?', [id_ejercicio], (err, results) => {
        if (err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/ejercicios/
 * @name Crear Ejercicio
 * @memberof module:routes/exercise
 * @description Crea un nuevo ejercicio. Delegado al controlador.
 * 
 * @access Private
 * @body {string} nombre_ejercicio - Nombre del ejercicio.
 * @body {number} [id_categoria] - ID de la categoría (opcional, 0 si ninguna).
 * 
 * @returns {Object} 200/201 - Éxito.
 * @returns {Object} 400 - Bad Request (duplicado).
 */
router.post("", exerciseController.createExerciseControl);

/**
 * @route PUT /api/ejercicios/:id_ejercicio
 * @name Actualizar Ejercicio
 * @memberof module:routes/exercise
 * @description Actualiza un ejercicio existente.
 * 
 * @access Private
 * @param {number} id_ejercicio - ID del ejercicio.
 * @body {string} nombre_ejercicio - Nuevo nombre.
 * @body {number} id_categoria - Nueva categoría.
 * 
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 400/404 - Error de validación o no encontrado.
 */
router.put("/:id_ejercicio", exerciseController.updateExerciseControl);

/**
 * @route DELETE /api/ejercicios/:id_ejercicio
 * @name Eliminar Ejercicio
 * @memberof module:routes/exercise
 * @description Elimina un ejercicio y sus dependencias operativas.
 * 
 * @access Private
 * @param {number} id_ejercicio - ID del ejercicio.
 * 
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 404/500 - Error.
 */
router.delete("/:id_ejercicio", exerciseController.deleteExerciseControl);

// ==========================================================
// GESTIÓN DE ASIGNACIÓN EJERCICIO-CATEGORÍA
// ==========================================================

/**
 * @route GET /api/ejercicios/asignacion-ejercicio-categoria
 * @name Listar Todas las Asignaciones (Categoría-Ejercicio)
 * @memberof module:routes/exercise
 * @description Obtiene el listado global de relaciones activas.
 * 
 * @access Public
 * @returns {Object} 200 - Array de asignaciones.
 */
router.get("/asignacion-ejercicio-categoria", categoryController.getLinksCategory_ExerciseControl);

/**
 * @route GET /api/ejercicios/asignacion-ejercicio-categoria/:id_ejercicio
 * @name Obtener Categoría de un Ejercicio
 * @memberof module:routes/exercise
 * @description Obtiene la categoría asignada a un ejercicio específico.
 * 
 * @access Public
 * @param {number} id_ejercicio - ID del ejercicio.
 * 
 * @returns {Object} 200 - Éxito. Array con datos de la categoría (o vacío si no tiene).
 * @returns {Object} 400 - ID inválido.
 */
router.get("/asignacion-ejercicio-categoria/:id_ejercicio", (req, res, next) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT categoria.id, categoria.nombre_categoria FROM categoria INNER JOIN ejercicio ON categoria.id = ejercicio.id_categoria WHERE ejercicio.id = ? ORDER BY categoria.nombre_categoria', [id_ejercicio], (err, results) => {
        if (err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/ejercicios/asignacion-ejercicio-categoria/asignar/:id_ejercicio/:id_categoria
 * @name Asignar Categoría a Ejercicio
 * @memberof module:routes/exercise
 * @description Crea la relación. Maneja conflictos 409.
 * 
 * @access Private
 * @param {number} id_ejercicio
 * @param {number} id_categoria
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 409 - Conflict (ya asignado).
 */
router.post("/asignacion-ejercicio-categoria/asignar/:id_ejercicio/:id_categoria", categoryController.linkCategoryToExerciseControl);

/**
 * @route DELETE /api/ejercicios/asignacion-ejercicio-categoria/desasignar/:id_ejercicio/:id_categoria
 * @name Desasignar Categoría
 * @memberof module:routes/exercise
 * @description Elimina la relación (pone id_categoria = 0).
 * 
 * @access Private
 * @returns {Object} 200 - Éxito.
 */
router.delete("/asignacion-ejercicio-categoria/desasignar/:id_ejercicio/:id_categoria", categoryController.unlinkCategoryFromExerciseControl);

// ==========================================================
// GESTIÓN DE ASIGNACIÓN EJERCICIO-VÍDEO
// ==========================================================

/**
 * @route GET /api/ejercicios/asignacion-ejercicio-video
 * @name Listar Todas las Asignaciones (Video-Ejercicio)
 * @memberof module:routes/exercise
 * @description Listado global de videos asignados.
 * 
 * @access Public
 */
router.get("/asignacion-ejercicio-video", videoController.getLinksVideo_ExerciseControl);

/**
 * @route GET /api/ejercicios/asignacion-ejercicio-video/:id_ejercicio
 * @name Obtener Video de un Ejercicio
 * @memberof module:routes/exercise
 * @description Obtiene el video demostrativo de un ejercicio.
 * Devuelve 404 explícito si no hay video asignado.
 * 
 * @access Public
 * @param {number} id_ejercicio
 * 
 * @returns {Object} 200 - Éxito. Datos del video.
 * @returns {Object} 404 - Not Found (sin video asignado).
 */
router.get("/asignacion-ejercicio-video/:id_ejercicio", (req, res, next) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT demostracion.id_video, video.nombre_video, video.enlace_video FROM demostracion INNER JOIN video ON demostracion.id_video = video.id WHERE demostracion.id_ejercicio = ? ORDER BY video.nombre_video', [id_ejercicio], (err, results) => {
        if (err) return next(err);
        // Manejo explícito de conjunto vacío: Retorna 404 semántico en lugar de array vacío
        else if(results.length === 0){
          return res.status(404).json({
            message: "Este ejercicio no tiene ningún vídeo asignado.",
            statusCode: 404})
        }
        return res.json(results);
    })
});

/**
 * @route POST /api/ejercicios/asignacion-ejercicio-video/asignar/:id_ejercicio/:id_video
 * @name Asignar Video a Ejercicio
 * @memberof module:routes/exercise
 * @description Asigna un video (1:1). Soporta forceReplace.
 * 
 * @access Private
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 409 - Conflict.
 */
router.post("/asignacion-ejercicio-video/asignar/:id_ejercicio/:id_video", exerciseController.linkExerciseToVideoControl);

/**
 * @route DELETE /api/ejercicios/asignacion-ejercicio-video/desasignar/:id_ejercicio
 * @name Desasignar Video
 * @memberof module:routes/exercise
 * @description Elimina la relación video-ejercicio.
 * 
 * @access Private
 * @returns {Object} 200 - Éxito.
 */
router.delete("/asignacion-ejercicio-video/desasignar/:id_ejercicio", exerciseController.unlinkExerciseFromVideoControl);

module.exports = router;