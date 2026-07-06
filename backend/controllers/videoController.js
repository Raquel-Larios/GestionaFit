const {
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation,
  linkVideoValidation,
} = require("../middleware/validation");
const {
  createVideo,
  updateVideo,
  deleteVideo,
  linkVideoToExercise,
  unlinkVideoFromExercise,
  getLinksVideo_Exercise,
} = require("../models/videoModel");

/**
 * Controlador: Creación de nuevo video educativo.
 * 
 * Extrae el nombre y el enlace del video del cuerpo de la solicitud.
 * Valida la integridad de los datos (formato de URL, longitud del nombre) y delega la creación al modelo.
 * 
 * @function createVideoControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre_video - Nombre descriptivo del video.
 * @param {string} req.body.enlace_video - URL del video.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la creación en el modelo.
 */
exports.createVideoControl = (req, res, next) => {
  const { nombre_video, enlace_video } = req.body;
  const params = {nombre_video, enlace_video};

  const { error } = createVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createVideo(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

/**
 * Controlador: Actualización de video existente.
 * 
 * Obtiene el ID desde los parámetros y los nuevos datos del cuerpo.
 * Valida los datos actualizados y ejecuta la modificación del registro.
 * 
 * @function updateVideoControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_video - ID del video a actualizar.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.nombre_video - Nuevo nombre del video.
 * @param {string} req.body.enlace_video - Nuevo enlace del video.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la actualización.
 */
exports.updateVideoControl = (req, res, next) => {
  const id_video = parseInt(req.params.id_video, 10);
  const { nombre_video, enlace_video } = req.body;
  const params = { nombre_video, enlace_video, id_video}

  const { error } = updateVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateVideo(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

/**
 * Controlador: Eliminación de video.
 * 
 * Elimina permanentemente un video de la base de datos identificado por su ID.
 * Valida que el ID sea correcto antes de ejecutar la baja.
 * 
 * @function deleteVideoControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_video - ID del video a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la eliminación.
 */
exports.deleteVideoControl = (req, res, next) => {
  const id_video = parseInt(req.params.id_video, 10);
  const params = {id_video}

  const { error } = deleteVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteVideo(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

/**
 * Controlador: Vincular video a un ejercicio.
 * 
 * Asocia un video educativo a un ejercicio específico.
 * Permite forzar la sustitución si el ejercicio ya tiene un video asignado (forceReplace).
 * 
 * @function linkVideoToExerciseControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_video - ID del video a vincular.
 * @param {number} req.params.id_ejercicio - ID del ejercicio destino.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {boolean} [req.body.forceReplace] - Si es true, reemplaza un video existente.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla o hay conflicto de vinculación.
 * @rejects {Object} Pasa error asíncrono si falla la vinculación.
 */
exports.linkVideoToExerciseControl = (req, res, next) => {
    const id_video = parseInt(req.params.id_video, 10);
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    let { forceReplace } = req.body || {};

    const params = {id_video, id_ejercicio, forceReplace}

    const { error } = linkVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };


    linkVideoToExercise(params)
    .then((result) => {
        const {statusCode = 200, message , data} = result;
        res.status(statusCode).send({message, data });
    })
    .catch((err) => {
        const {statusCode, message, data, code} = err;
        res.status(statusCode).send({ message, data, code}) && next(err);
    })
};

/**
 * Controlador: Desvincular video de un ejercicio.
 * 
 * Elimina la asociación entre un video y un ejercicio.
 * Nota: Reutiliza `deleteVideoValidation` para validar el ID del video.
 * 
 * @function unlinkVideoFromExerciseControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_video - ID del video a desvincular.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la desvinculación.
 */
exports.unlinkVideoFromExerciseControl = (req, res, next) => {
    const id_video = parseInt(req.params.id_video, 10);
    const params = {id_video}

    // Reutiliza validación de ID
    const { error } = deleteVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    unlinkVideoFromExercise(params)
    .then((result) => {
        const {statusCode = 200, message , data} = result;
        res.status(statusCode).send({message, data });
    })
    .catch((err) => {
        const {statusCode, message, data, code} = err;
        res.status(statusCode).send({ message, data, code}) && next(err);
    })
};

/**
 * Controlador: Obtener todos los enlaces video-ejercicio.
 * 
 * Recupera la lista completa de asociaciones entre videos y ejercicios.
 * No requiere parámetros de entrada. Maneja los errores directamente en la respuesta JSON.
 * 
 * @function getLinksVideo_ExerciseControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * 
 * @returns {void} Envía array JSON con las asociaciones o error 500.
 * @rejects {Object} Devuelve error 500 en el cuerpo de la respuesta si falla la consulta.
 */
exports.getLinksVideo_ExerciseControl = (req, res) => {

  getLinksVideo_Exercise({})
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    res.status(500).json({ error: err.message });
  })
}