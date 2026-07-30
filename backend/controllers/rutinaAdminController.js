const {
  createRutinaAdminValidation,
  updateRutinaAdminValidation,
  deleteRutinaAdminValidation
} = require("../middleware/validation");
const { createRutinaAdmin, updateRutinaAdmin, unlinkRutinaAdmin} = require("../models/rutinaAdminModel");

/**
 * Controlador: Asignación de plantilla de rutina a un usuario (Admin).
 * 
 * Convierte los parámetros de la URL a enteros y valida la integridad de los IDs.
 * Si la validación falla, lanza un error 400 inmediato. Ejecuta la asignación
 * de forma asíncrona; en éxito, devuelve los datos de la nueva rutina.
 * En error, responde al cliente y notifica al middleware de errores.
 * 
 * @function createRutinaAdminControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.id_usuario - ID del usuario destinatario.
 * @param {string} req.params.id_plantilla - ID de la plantilla a asignar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP o pasa error a next().
 * @rejects {Object} Lanza error 400 si la validación de parámetros falla.
 * @rejects {Object} Rechaza con error personalizado si falla la asignación en BD.
 */
exports.createRutinaAdminControl = (req, res, next) => {
  // 1. Parseo y normalización de IDs desde la URL
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const id_plantilla = parseInt(req.params.id_plantilla, 10);
  const params = {id_usuario, id_plantilla};

  // 2. Validación de esquema
  const { error } = createRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución asíncrona de la asignación
  createRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

/**
 * Controlador: Actualización de bloques de una rutina asignada (Admin).
 * 
 * Actualiza la estructura de bloques de una rutina específica en el historial
 * del usuario, sin alterar la plantilla base por defecto. Valida que el ID
 * de historial y la estructura de bloques sean correctos antes de proceder.
 * 
 * @function updateRutinaAdminControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.id_historial - ID del registro de historial a editar.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {Array} req.body.bloques - Array con la nueva configuración de bloques.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP o pasa error a next().
 * @rejects {Object} Lanza error 400 si la validación de entrada falla.
 * @rejects {Object} Rechaza con error personalizado si falla la actualización.
 */
exports.updateRutinaAdminControl = (req, res, next) => {
  // 1. Extracción y parseo del ID y los bloques
  const id_historial = parseInt(req.params.id_historial, 10);
  const { bloques } = req.body;
  const params = {id_historial, bloques}

  // 2. Validación de esquema
  const { error } = updateRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución asíncrona de la actualización
  updateRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

/**
 * Controlador: Eliminación de asignación de rutina a usuario (Admin).
 * 
 * Elimina el registro de historial que vincula una plantilla con un usuario.
 * Valida que el ID de historial exista y sea válido antes de ejecutar la baja.
 * 
 * @function deleteRutinaAdminControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.id_historial - ID del registro de historial a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP o pasa error a next().
 * @rejects {Object} Lanza error 400 si la validación del ID falla.
 * @rejects {Object} Rechaza con error personalizado si falla la eliminación.
 */
exports.unlinkRutinaAdminControl = (req, res, next) => {
  // 1. Parseo del ID de historial
  const id_historial = parseInt(req.params.id_historial, 10);
  const params = {id_historial};

  // 2. Validación de esquema
  const { error } = deleteRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución asíncrona de la eliminación
  unlinkRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

