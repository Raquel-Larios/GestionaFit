const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");
const templateController = require("../controllers/templateController");

/**
 * @route GET /api/clientes
 * @name Listar Todos los Clientes
 * @memberof module:routes/user
 * @description Obtiene una lista de todos los usuarios con rol de cliente (rol = 0).
 * Permite ordenar dinámicamente por nombre o por apellidos mediante query param.
 * Excluye datos sensibles como la contraseña o el peso.
 * 
 * @access Private (Admin)
 * 
 * @param {string} [req.query.by_nombre] - Si está presente, ordena por nombre ASC. Si no, por apellidos ASC.
 * 
 * @returns {Object} 200 - Éxito. Array de objetos cliente.
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL dinámica.
 */
router.get("/clientes", (req, res, next) => {
    const { by_nombre } = req.query;

    // 1. Construcción base de la consulta con ordenamiento dinámico seguro
    let query = 'SELECT id, nombre, apellidos, email, foto_perfil FROM usuario WHERE rol = 0 ORDER BY ';
  
    if (by_nombre) {
        query += 'nombre ASC';
    } else {
        query += 'apellidos ASC';
    }

    // 2. Ejecución y manejo de errores
    db.query(query, (err, results) => {
        if (err) return(err);
        res.json(results);
    });
});

/**
 * @route GET /api/clientes/:id_usuario
 * @name Obtener Cliente por ID
 * @memberof module:routes/user
 * @description Obtiene los datos básicos de un cliente específico filtrando por ID y rol.
 * Útil para vistas rápidas de administración sin datos sensibles.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_usuario - ID del cliente a consultar.
 * 
 * @returns {Object} 200 - Éxito. Array con los datos del cliente (vacío si no existe o no es cliente).
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL.
 */
router.get("/clientes/:id_usuario", (req, res, next) =>{
    db.query('SELECT id, email, nombre, apellidos FROM usuario WHERE id = ? AND rol = 0', [req.params.id_usuario], (err, results) => {
        if(err) return next(err);
        res.json(results);
    })
})

/**
 * @route GET /api/:id_usuario/profile
 * @name Obtener Perfil Completo por ID
 * @memberof module:routes/user
 * @description Obtiene todos los datos del perfil de un usuario.
 * Incluye campos sensibles como 'isPassGenerated' y 'peso'. No filtra por rol (válido para cualquier usuario).
 * 
 * @access Private (Usuario propio o Admin)
 * 
 * @param {number} id_usuario - ID del usuario propietario del perfil.
 * 
 * @returns {Object} 200 - Éxito. Array con los datos completos del perfil.
 * @returns {Object} 500 - Error interno. Fallo en la consulta SQL.
 */
router.get("/:id_usuario/profile", (req, res, next) =>{
    db.query('SELECT id, email, nombre, apellidos, isPassGenerated, foto_perfil, peso FROM usuario WHERE id = ?', [req.params.id_usuario], (err, results) => {
        if(err) return next(err);
        res.json(results);
    })
})

/**
 * @route POST /api/clientes
 * @name Crear Nuevo Cliente
 * @memberof module:routes/user
 * @description Ejecuta el controlador para crear un nuevo usuario con rol de cliente.
 * Genera contraseña automática y envía correo de bienvenida (lógica en controlador).
 * 
 * @access Private (Admin)
 * 
 * @param {Object} req.body - Cuerpo con email, nombre y apellidos.
 * 
 * @returns {Object} 200 - Éxito. Cliente creado.
 * @returns {Object} 400 - Bad Request. Validación fallida o email duplicado.
 * @returns {Object} 500 - Error interno.
 */
router.post("/clientes", userController.createUserControl);

/**
 * @route PUT /api/clientes/:id_usuario
 * @name Actualizar Datos de Cliente (Admin)
 * @memberof module:routes/user
 * @description Ejecuta el controlador para actualizar datos básicos (email, nombre, apellidos) de un cliente.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_usuario - ID del cliente a actualizar.
 * @param {Object} req.body - Cuerpo con los nuevos datos.
 * 
 * @returns {Object} 200 - Éxito. Cliente actualizado.
 * @returns {Object} 400 - Bad Request. Validación fallida o email duplicado.
 * @returns {Object} 404 - Not Found. Cliente no encontrado.
 * @returns {Object} 500 - Error interno.
 */
router.put("/clientes/:id_usuario", userController.updateUserControl);

/**
 * @route PUT /api/:id_usuario/profile
 * @name Actualizar Perfil Completo
 * @memberof module:routes/user
 * @description Ejecuta el controlador para actualizar el perfil propio (incluyendo contraseña, peso y foto).
 * Valida la identidad del usuario antes de aplicar cambios críticos.
 * 
 * @access Private (Usuario propio)
 * 
 * @param {number} id_usuario - ID del usuario propietario.
 * @param {Object} req.body - Cuerpo con los datos a actualizar.
 * 
 * @returns {Object} 200 - Éxito. Perfil actualizado.
 * @returns {Object} 400 - Bad Request. Validación fallida.
 * @returns {Object} 500 - Error interno.
 */
router.put("/:id_usuario/profile", userController.updateProfileControl);

/**
 * @route PUT /api/:id_usuario/profile/photo
 * @name Actualizar Solo Foto de Perfil
 * @memberof module:routes/user
 * @description Ejecuta el controlador para actualizar exclusivamente la imagen de perfil.
 * 
 * @access Private (Usuario propio)
 * 
 * @param {number} id_usuario - ID del usuario propietario.
 * @param {Object} req.body - Datos de la nueva foto (Base64 o URL).
 * 
 * @returns {Object} 200 - Éxito. Foto actualizada.
 * @returns {Object} 400 - Bad Request. Validación fallida.
 * @returns {Object} 500 - Error interno.
 */
router.put("/:id_usuario/profile/photo", userController.updateProfilePhotoControl);

/**
 * @route DELETE /api/clientes/:id_usuario
 * @name Eliminar Cliente
 * @memberof module:routes/user
 * @description Ejecuta el controlador para eliminar permanentemente un cliente y sus datos asociados.
 * 
 * @access Private (Admin)
 * 
 * @param {number} id_usuario - ID del cliente a eliminar.
 * 
 * @returns {Object} 200 - Éxito. Cliente eliminado.
 * @returns {Object} 404 - Not Found. Cliente no encontrado.
 * @returns {Object} 500 - Error interno.
 */
router.delete("/clientes/:id_usuario", userController.deleteUserControl);

//GESTIÓN ASIGNACIÓN A PLANTILLA DENTRO DE CLIENTE (Preparado para implementar)
//router.get("/clientes/:id_usuario/:id_plantilla", templateController.getUserTemplatesControl);
//router.put("/clientes/:id_usuario/:id_plantilla", userController.linkUserToTemplateControl);
//router.delete("/clientes/:id_usuario/:id_plantilla", userController.unlinkUserFromTemplateControl);

module.exports = router;