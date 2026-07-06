const {
  updateRutinaClienteValidation
} = require("../middleware/validation");
const { updateRutinaCliente } = require("../models/rutinaClienteModel");

/**
 * Controlador: Actualización de rutina propia del cliente.
 * 
 * Gestiona la petición de actualización de una rutina asignada. Valida los parámetros
 * de entrada (id_historial, id_usuario y bloques) para asegurar la integridad y propiedad.
 * Delega la lógica de negocio y optimización de escritura al modelo.
 * 
 * @function updateRutinaClienteControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_historial - ID de la rutina a actualizar.
 * @param {number} req.params.id_usuario - ID del usuario (validación de propiedad).
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {Array} req.body.bloques - Nueva estructura de bloques y variaciones.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200/400 o pasa el error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación de entrada falla.
 * @rejects {Object} Pasa error asíncrono a next() si falla la actualización en el modelo.
 */
exports.updateRutinaClienteControl = (req, res, next) => {
  // 1. Parseo y normalización de IDs
  const id_historial = parseInt(req.params.id_historial, 10);
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const { bloques } = req.body;
  const params = {id_historial, id_usuario, bloques}

  // 2. Validación de esquema
  const { error } = updateRutinaClienteValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución de la lógica de negocio
  updateRutinaCliente(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};