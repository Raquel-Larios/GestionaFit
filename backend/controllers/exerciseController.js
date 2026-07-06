const {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  linkVideoValidation
} = require("../middleware/validation");
const {
  createExercise,
  updateExercise,
  deleteExercise,
  linkExerciseToVideo,
  unlinkExerciseFromVideo
} = require("../models/exerciseModel");

/**
 * Controlador para la creación de nuevos ejercicios.
 * 
 * Valida los datos de entrada y normaliza el ID de categoría a entero.
 * Permite que un ejercicio se cree sin categoría asignada (id_categoria: 0).
 * 
 * @async
 * @function createExerciseControl
 * @param {express.Request} req - Petición HTTP.
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON (201 Created o 400 Bad Request).
 * @throws {Error} Pasa el error al middleware global si la validación falla.
 */
exports.createExerciseControl = (req, res, next) => {
  const { nombre_ejercicio, id_categoria } = req.body;
  // Normalización de tipos: Convierte id_categoria a entero o 0 si no existe
  // Esto evita errores de tipo en la consulta SQL
  const params = {
  nombre_ejercicio,
  id_categoria: id_categoria ? parseInt(id_categoria, 10) : 0
  };

  const { error } = createExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createExercise(params)
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
 * Controlador para la actualización de ejercicios existentes.
 * 
 * Normaliza los IDs de categoría y ejercicio a enteros, permitiendo categoría nula (0).
 * Valida los nuevos datos antes de ejecutar la actualización en la base de datos.
 * 
 * @function updateExerciseControl
 * @param {express.Request} req - Petición HTTP (params: { id_ejercicio }, body: { nombre_ejercicio, id_categoria }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON con el ejercicio actualizado (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si la validación o el parseo de IDs falla.
 */
exports.updateExerciseControl = (req, res, next) => {
  const { nombre_ejercicio, id_categoria } = req.body;

  // Conversión explícita de IDs a enteros para seguridad de tipos
  const params = {
    nombre_ejercicio,
    id_categoria: id_categoria ? parseInt(id_categoria, 10) : 0,
    id_ejercicio: parseInt(req.params.id_ejercicio, 10)
  }

  const { error } = updateExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateExercise(params)
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
 * Controlador para la eliminación de ejercicios del sistema.
 * 
 * Extrae y valida el ID del ejercicio desde los parámetros de la ruta,
 * asegurando que sea un entero válido antes de ejecutar el borrado.
 * 
 * @function deleteExerciseControl
 * @param {express.Request} req - Petición HTTP (params: { id_ejercicio }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación de borrado (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si el ID es inválido o la validación falla.
 */
exports.deleteExerciseControl = (req, res, next) => {
  // Normalización de tipos: Asegura que el ID sea un entero válido
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_ejercicio};

  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteExercise(params)
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
 * Controlador para asignar un video demostrativo a un ejercicio.
 * 
 * Gestiona la relación uno-a-uno normalizando los IDs. Soporta el flag 
 * 'forceReplace' para sobrescribir videos existentes si se confirma explícitamente.
 * 
 * @function linkExerciseToVideoControl
 * @param {express.Request} req - Petición HTTP (params: { id_ejercicio, id_video }, body: { forceReplace }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación del enlace (200) o error de validación.
 * @throws {Object} Lanza un error personalizado (400) si los IDs son inválidos o la validación falla.
 */
exports.linkExerciseToVideoControl = (req, res, next) => {
    // Normalización de tipos: Conversión explícita a entero para seguridad SQL
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    const id_video = parseInt(req.params.id_video, 10);
    // forceReplace permite al usuario confirmar la sustitución de un video previo
    let { forceReplace } = req.body || {};
    const params = {id_video, id_ejercicio, forceReplace}

    const { error } = linkVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    linkExerciseToVideo(params)
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
 * Controlador para eliminar la asignación de video de un ejercicio.
 * 
 * Normaliza el ID del ejercicio y reutiliza la validación de existencia
 * para garantizar que la operación se realiza sobre un identificador válido.
 * 
 * @function unlinkExerciseFromVideoControl
 * @param {express.Request} req - Petición HTTP (params: { id_ejercicio }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación del borrado del enlace (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si el ID es inválido.
 */
exports.unlinkExerciseFromVideoControl = (req, res, next) => {
  // Normalización de tipos: Asegura integridad del ID antes de la operación
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_ejercicio}

  // Reutiliza validación básica de existencia de ID
  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  unlinkExerciseFromVideo(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
}