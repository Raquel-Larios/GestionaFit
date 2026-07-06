const express = require("express");
const router = express.Router();
// Importación del controlador que contiene la lógica de negocio de autenticación
const authController = require("../controllers/authController");

/**
 * @route POST /api/auth/login
 * @name Login de Usuario
 * @memberof module:routes/auth
 * @description Endpoint público para la autenticación de usuarios.
 * Valida las credenciales y devuelve un token JWT junto con los datos públicos del usuario.
 * 
 * @access Public
 * 
 * @body {string} email - Correo electrónico del usuario (requerido).
 * @body {string} contraseña - Contraseña en texto plano (requerido).
 * 
 * @returns {Object} 200 - Éxito. Devuelve { message, data: { id, nombre, rol, ... }, token }.
 * @returns {Object} 400 - Bad Request. Credenciales inválidas o datos faltantes.
 * @returns {Object} 500 - Internal Server Error. Fallo en el servidor o base de datos.
 * 
 * @example {json} Respuesta-200
 * {
 *   "message": "Loggeado correctamente.",
 *   "data": { "id": 1, "nombre": "Juan", "rol": "admin" },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 * }
 */
router.post("/login", authController.loginUserControl);
/**
 * @route PUT /api/auth/forgotten-pass
 * @name Recuperación de Contraseña
 * @memberof module:routes/auth
 * @description Endpoint público para solicitar el restablecimiento de contraseña.
 * Genera una contraseña temporal, la almacena hasheada y envía un correo al usuario.
 * 
 * @access Public
 * 
 * @body {string} email - Correo electrónico registrado (requerido).
 * 
 * @returns {Object} 200 - Éxito. Confirma el envío del correo.
 * @returns {Object} 400 - Bad Request. Email con formato inválido.
 * @returns {Object} 404 - Not Found. El email no está registrado en la base de datos.
 * @returns {Object} 500 - Internal Server Error. Fallo al enviar el correo o actualizar la BD.
 * 
 * @example {json} Respuesta-200
 * {
 *   "message": "Contraseña restablecida. Se ha enviado un correo con las nuevas credenciales.",
 *   "statusCode": 200
 * }
 */
router.put("/forgotten-pass", authController.forgottenPassControl);

// Exportación del router para ser montado en el archivo principal
module.exports = router;