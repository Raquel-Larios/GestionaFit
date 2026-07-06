const {
  createTemplateValidation,
  updateTemplateValidation,
  deleteTemplateValidation,
  createRutinaAdminValidation
} = require("../middleware/validation");
const { createTemplate, updateTemplate, deleteTemplate, deleteRutinaPlantilla} = require("../models/templateModel");

/**
 * Controlador: Creación de nueva plantilla de rutina (defecto).
 * 
 * Extrae el nombre y la estructura de bloques del cuerpo de la solicitud.
 * Valida los datos de entrada y delega la creación al modelo.
 * 
 * @function createTemplateControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre_plantilla - Nombre de la nueva plantilla.
 * @param {Array} req.body.bloques - Estructura de bloques y ejercicios.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la creación en el modelo.
 */
exports.createTemplateControl = (req, res, next) => {
  const { nombre_plantilla, bloques} = req.body;
  const params = {nombre_plantilla, bloques}

  // Validación de entrada
  const { error } = createTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createTemplate(params)
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
 * Controlador: Actualización de plantilla existente (defecto).
 * 
 * Obtiene el ID de la plantilla desde el cuerpo (o parámetros), junto con los nuevos datos.
 * Valida la integridad de los bloques actualizados y ejecuta la modificación.
 * 
 * @function updateTemplateControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {number} req.body.id - ID de la plantilla a actualizar.
 * @param {string} req.body.nombre_plantilla - Nuevo nombre de la plantilla.
 * @param {Array} req.body.bloques - Nueva estructura de bloques.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la actualización.
 */
exports.updateTemplateControl = (req, res, next) => {
  const id_plantilla = parseInt(req.body.id, 10);
  const { nombre_plantilla, bloques} = req.body;
  const params = {id_plantilla, nombre_plantilla, bloques}

  const { error } = updateTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };
    

  updateTemplate(params)
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
 * Controlador: Eliminación de plantilla (defecto).
 * 
 * Extrae el ID de la plantilla desde los parámetros de la URL.
 * Valida el ID y ejecuta la eliminación lógica o física de la plantilla.
 * 
 * @function deleteTemplateControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.id_plantilla - ID de la plantilla a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la eliminación.
 */
exports.deleteTemplateControl = (req, res, next) => {
  const id_plantilla = parseInt(req.params.id_plantilla, 10);
  const params = {id_plantilla}

  const { error } = deleteTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteTemplate(params)
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
 * Controlador: Eliminación de asignación específica Plantilla-Usuario.
 * 
 * Elimina el vínculo entre una plantilla y un usuario sin borrar la plantilla base.
 * Valida que ambos IDs sean correctos antes de proceder.
 * 
 * @function deleteRutinaPlantillaControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del usuario afectado.
 * @param {number} req.params.id_plantilla - ID de la plantilla a desvincular.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación de IDs falla.
 * @rejects {Object} Pasa error asíncrono si falla la desvinculación.
 */
exports.deleteRutinaPlantillaControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const id_plantilla = parseInt(req.params.id_plantilla, 10);
  const params = {id_usuario, id_plantilla};

  // Reutiliza validación básica de existencia de ID
  const { error } = createRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteRutinaPlantilla(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};
