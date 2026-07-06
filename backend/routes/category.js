const express = require("express");
const router = express.Router();
const db = require('../database/db');
const categoryController = require("../controllers/categoryController");

// ==========================================================
// GESTIÓN DE CATEGORÍAS (CRUD)
// ==========================================================

/**
 * @route GET /api/categorias/all
 * @name Listar Todas las Categorías
 * @memberof module:routes/category
 * @description Endpoint público para listar todas las categorías ordenadas alfabéticamente.
 * Se implementa con consulta directa por su simplicidad (solo lectura).
 * 
 * @access Public
 * 
 * @returns {Object} 200 - Éxito. Devuelve array de objetos { id, nombre_categoria }.
 * @returns {Object} 500 - Error interno del servidor.
 * 
 * @example {json} Respuesta-200
 * [
 *   { "id": 1, "nombre_categoria": "Cardio" },
 *   { "id": 2, "nombre_categoria": "Fuerza" }
 * ]
 */
router.get("/all", (req, res, next) => {
    db.query('SELECT id, nombre_categoria FROM categoria ORDER BY nombre_categoria ASC', (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route GET /api/categorias/:id_categoria
 * @name Obtener Categoría por ID
 * @memberof module:routes/category
 * @description Endpoint para obtener los detalles de una categoría específica.
 * Normaliza el ID a entero para evitar errores de tipo en la consulta.
 * 
 * @access Public
 * 
 * @param {number} id_categoria - ID de la categoría (path parameter).
 * 
 * @returns {Object} 200 - Éxito. Devuelve array con el objeto categoría (o vacío si no existe).
 * @returns {Object} 400 - Bad Request. ID inválido.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.get("/:id_categoria", (req, res, next) => {
    // Conversión explícita a entero para seguridad de tipos
    const id_categoria = parseInt(req.params.id_categoria, 10);
    db.query('SELECT * FROM categoria WHERE id = ?', [id_categoria], (err, results) => {
        if (err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/categorias/
 * @name Crear Categoría
 * @memberof module:routes/category
 * @description Endpoint para crear una nueva categoría.
 * Delega la lógica de validación de unicidad y escritura al controlador.
 * 
 * @access Private (Requiere autenticación)
 * 
 * @body {string} nombre_categoria - Nombre de la nueva categoría (requerido).
 * 
 * @returns {Object} 200/201 - Éxito. Categoría creada.
 * @returns {Object} 400 - Bad Request. Nombre duplicado o datos inválidos.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.post("", categoryController.createCategoryControl);

/**
 * @route PUT /api/categorias/:id_categoria
 * @name Actualizar Categoría
 * @memberof module:routes/category
 * @description Endpoint para actualizar una categoría existente.
 * Valida que el nuevo nombre no colisione con otros registros.
 * 
 * @access Private
 * 
 * @param {number} id_categoria - ID de la categoría a actualizar.
 * @body {string} nombre_categoria - Nuevo nombre de la categoría.
 * 
 * @returns {Object} 200 - Éxito. Categoría actualizada.
 * @returns {Object} 400 - Bad Request. Nombre duplicado.
 * @returns {Object} 404 - Not Found. Categoría no encontrada.
 */
router.put("/:id_categoria", categoryController.updateCategoryControl);

/**
 * @route DELETE /api/categorias/:id_categoria
 * @name Eliminar Categoría
 * @memberof module:routes/category
 * @description Endpoint para eliminar una categoría y sus dependencias operativas.
 * Implementa cascada manual desde el controlador/servicio.
 * 
 * @access Private
 * 
 * @param {number} id_categoria - ID de la categoría a eliminar.
 * 
 * @returns {Object} 200 - Éxito. Categoría eliminada.
 * @returns {Object} 404 - Not Found. Categoría no encontrada.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.delete("/:id_categoria", categoryController.deleteCategoryControl);

// ==========================================================
// GESTIÓN DE ASIGNACIONES CATEGORÍA-EJERCICIO
// ==========================================================

/**
 * @route GET /api/categorias/asignacion-categoria-ejercicio
 * @name Listar Todas las Asignaciones
 * @memberof module:routes/category
 * @description Obtiene el listado global de todas las relaciones activas (JOIN).
 * Delegado al controlador para usar la lógica de consolidación de datos.
 * 
 * @access Public
 * 
 * @returns {Object} 200 - Éxito. Array de asignaciones { id_ejercicio, nombre_ejercicio, id_categoria, nombre_categoria }.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.get("/asignacion-categoria-ejercicio", categoryController.getLinksCategory_ExerciseControl);

/**
 * @route GET /api/categorias/asignacion-categoria-ejercicio/:id_categoria
 * @name Obtener Ejercicios por Categoría
 * @memberof module:routes/category
 * @description Obtiene todos los ejercicios asignados a una categoría específica.
 * Implementa un JOIN directo para filtrar y ordenar por nombre de ejercicio.
 * 
 * @access Public
 * 
 * @param {number} id_categoria - ID de la categoría filtro.
 * 
 * @returns {Object} 200 - Éxito. Array de ejercicios.
 * @returns {Object} 400 - Bad Request. ID de categoría inválido.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.get("/asignacion-categoria-ejercicio/:id_categoria", (req, res, next) => {
    const id_categoria = parseInt(req.params.id_categoria, 10);
    // 1. Optimización: Solo trae lo necesario (id y nombre del ejercicio)
    db.query('SELECT ejercicio.id, ejercicio.nombre_ejercicio FROM ejercicio INNER JOIN categoria ON ejercicio.id_categoria = categoria.id WHERE id_categoria = ? ORDER BY ejercicio.nombre_ejercicio', [id_categoria], (err, results) => {
        if (err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/categorias/asignar/:id_categoria/:id_ejercicio
 * @name Asignar Categoría a Ejercicio
 * @memberof module:routes/category
 * @description Crea una relación entre categoría y ejercicio.
 * Maneja conflictos (409) si el ejercicio ya tiene una categoría asignada.
 * 
 * @access Private
 * 
 * @param {number} id_categoria - ID de la categoría.
 * @param {number} id_ejercicio - ID del ejercicio.
 * @body {boolean} [forceReplace] - Opcional. Si es true, sobrescribe la categoría anterior.
 * 
 * @returns {Object} 200 - Éxito. Asignación realizada.
 * @returns {Object} 409 - Conflict. El ejercicio ya tiene categoría (se requiere forceReplace).
 * @returns {Object} 404 - Not Found. Categoría o ejercicio no existen.
 */
router.post("/asignar/:id_categoria/:id_ejercicio", categoryController.linkCategoryToExerciseControl);

/**
 * @route DELETE /api/categorias/desasignar/:id_categoria/:id_ejercicio
 * @name Desasignar Categoría de Ejercicio
 * @memberof module:routes/category
 * @description Elimina la relación, dejando el ejercicio sin categoría (id_categoria = 0).
 * 
 * @access Private
 * 
 * @param {number} id_categoria - ID de la categoría.
 * @param {number} id_ejercicio - ID del ejercicio.
 * 
 * @returns {Object} 200 - Éxito. Relación eliminada.
 * @returns {Object} 404 - Not Found. La asignación no existe.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.delete("/desasignar/:id_categoria/:id_ejercicio", categoryController.unlinkCategoryFromExerciseControl);

// Exportación del router para ser montado en el archivo principal
module.exports = router;
