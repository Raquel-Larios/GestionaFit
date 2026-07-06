const express = require("express");
const router = express.Router();
const db = require('../database/db');

const materialController = require("../controllers/materialController");

/**
 * @route GET /api/materiales/all
 * @name Listar Todos los Materiales
 * @memberof module:routes/material
 * @description Endpoint público para listar materiales.
 * Permite ordenar por nombre o por ID (defecto) mediante validación estricta.
 * 
 * @access Public
 * 
 * @query {string} [by_nombre] - Si está presente ("true"), ordena por nombre ASC. Si no, por ID DESC.
 * 
 * @returns {Object} 200 - Éxito. Array de materiales { id, nombre_material, contenido }.
 * @returns {Object} 500 - Error interno del servidor.
 * 
 * @example {json} Respuesta-200
 * [
 *   { "id": 1, "nombre_material": "Tabla RPE", "contenido": "..." }
 * ]
 */
router.get("/all", (req, res, next) => {
    const { by_nombre } = req.query;

  let query = 'SELECT id, nombre_material, contenido FROM material ORDER BY ';
  
  if (by_nombre) {
    query += 'nombre_material ASC';
  } else {
    query += 'id DESC';
  }

  db.query(query, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

/**
 * @route GET /api/materiales/:id_material
 * @name Obtener Material por ID
 * @memberof module:routes/material
 * @description Obtiene los detalles de un material específico.
 * Normaliza el ID a entero para seguridad de tipos.
 * 
 * @access Public
 * 
 * @param {number} id_material - ID del material.
 * 
 * @returns {Object} 200 - Éxito. Array con datos del material.
 * @returns {Object} 400 - Bad Request. ID inválido.
 * @returns {Object} 500 - Error interno.
 */
router.get("/:id_material", (req, res, next) => {
    const id_material = parseInt(req.params.id_material, 10);
    db.query('SELECT id, nombre_material, contenido FROM material WHERE id = ?', [id_material], (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
});

/**
 * @route POST /api/materiales/
 * @name Crear Material
 * @memberof module:routes/material
 * @description Crea un nuevo material educativo.
 * 
 * @access Private
 * @body {string} nombre_material - Nombre del material.
 * @body {string} contenido - Contenido del material.
 * @returns {Object} 200/201 - Éxito.
 * @returns {Object} 400 - Bad Request (duplicado).
 */
router.post("", materialController.createMaterialControl);

/**
 * @route PUT /api/materiales/:id_material
 * @name Actualizar Material
 * @memberof module:routes/material
 * @description Actualiza un material existente.
 * 
 * @access Private
 * @param {number} id_material - ID del material.
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 400/404 - Error de validación o no encontrado.
 */
router.put("/:id_material", materialController.updateMaterialControl);

/**
 * @route DELETE /api/materiales/:id_material
 * @name Eliminar Material
 * @memberof module:routes/material
 * @description Elimina un material del sistema.
 * 
 * @access Private
 * @param {number} id_material - ID del material.
 * @returns {Object} 200 - Éxito.
 * @returns {Object} 404/500 - Error.
 */
router.delete("/:id_material", materialController.deleteMaterialControl);

module.exports = router;