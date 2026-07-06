const {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  linkCategoryToExerciseValidation,
} = require("../middleware/validation");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  linkCategoryToExercise,
  unlinkCategoryFormExercise,
  getLinksCategory_Exercise,
} = require("../models/categoryModel");

/**
 * Controlador para la creación de nuevas categorías.
 * 
 * Valida que el nombre de la categoría cumpla los criterios de seguridad
 * y delega la inserción en la base de datos al modelo correspondiente.
 * 
 * @function createCategoryControl
 * @param {express.Request} req - Petición HTTP (body: { nombre_categoria }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON con la categoría creada (200) o error de validación.
 * @throws {Object} Lanza un error personalizado (400) si la validación del nombre falla.
 */
exports.createCategoryControl = (req, res, next) => {
  // 1. Extracción y empaquetado de parámetros
  const { nombre_categoria } = req.body;
  const params = {nombre_categoria}

  // 2. Validación de esquema
  const { error } = createCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución del servicio de creación
  createCategory(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      // Manejo estándar de errores: envío de respuesta y pase al middleware global
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

/**
 * Controlador para la actualización de categorías existentes.
 * 
 * Obtiene el ID de la URL y lo normaliza a entero para garantizar la integridad de la consulta SQL.
 * Valida el nuevo nombre antes de ejecutar la actualización en la base de datos.
 * 
 * @function updateCategoryControl
 * @param {express.Request} req - Petición HTTP (params: { id_categoria }, body: { nombre_categoria }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON con la categoría actualizada (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si el ID es inválido o la validación falla.
 */
exports.updateCategoryControl = (req, res, next) => {
  // Extracción de datos: nombre del body y ID de los parámetros de la URL
  const { nombre_categoria } = req.body;
  // Conversión explícita a entero para evitar inyección de tipos en la consulta SQL
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const params = {nombre_categoria, id_categoria}

  const { error } = updateCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // Patrón de promesa idéntico a createCategoryControl
  updateCategory(params)
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
 * Controlador para la eliminación de categorías del sistema.
 * 
 * Extrae y valida el ID de la categoría desde los parámetros de la ruta,
 * asegurando que sea un entero válido antes de ejecutar el borrado.
 * 
 * @function deleteCategoryControl
 * @param {express.Request} req - Petición HTTP (params: { id_categoria }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación de borrado (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si el ID no es numérico o la validación falla.
 */
exports.deleteCategoryControl = (req, res, next) => {
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const params = {id_categoria}

  const { error } = deleteCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // Ejecución de borrado con manejo estándar de errores
  deleteCategory(params)
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
 * Controlador para asignar una categoría a un ejercicio específico.
 * 
 * Valida y normaliza los IDs a enteros. Permite forzar la sustitución 
 * de categorías existentes si se especifica `forceReplace: true` en el cuerpo.
 * 
 * @function linkCategoryToExerciseControl
 * @param {express.Request} req - Petición HTTP (params: { id_categoria, id_ejercicio }, body: { forceReplace }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación del enlace (200) o error de validación.
 * @throws {Object} Lanza un error personalizado (400) si los IDs son inválidos o la validación falla.
 */
exports.linkCategoryToExerciseControl = (req, res, next) => {
  // Normalización de tipos: Conversión explícita a entero para seguridad SQL
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  // forceReplace es opcional: si es true, podría eliminar asignaciones previas
  let { forceReplace } = req.body || {};
  const params = {id_categoria, id_ejercicio, forceReplace}

  const { error } = linkCategoryToExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  linkCategoryToExercise(params)
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
 * Controlador para eliminar la asignación entre categoría y ejercicio.
 * 
 * Normaliza los IDs de los parámetros y reutiliza la validación de estructura
 * del método de enlace para garantizar consistencia en los datos de entrada.
 * 
 * @function unlinkCategoryFromExerciseControl
 * @param {express.Request} req - Petición HTTP (params: { id_categoria, id_ejercicio }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación del borrado del enlace (200) o error.
 * @throws {Object} Lanza un error personalizado (400) si la validación de los IDs falla.
 */
exports.unlinkCategoryFromExerciseControl = (req, res, next) => {
  // Normalización de tipos: Asegura integridad de los IDs antes de la operación
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_categoria, id_ejercicio}

  // Reutiliza la validación de estructura de parámetros del método de enlace
  const { error } = linkCategoryToExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  unlinkCategoryFormExercise(params)
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
 * Controlador para obtener todas las asignaciones existentes entre categorías y ejercicios.
 * 
 * Recupera el listado completo de relaciones sin requerir parámetros de entrada.
 * Centraliza el manejo de errores para devolver un formato JSON consistente.
 * 
 * @function getLinksCategory_ExerciseControl
 * @param {express.Request} req - Petición HTTP.
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía un JSON con el listado de asignaciones (200) o error de servidor.
 * @throws {Error} Pasa el error al middleware global si la consulta a la base de datos falla.
 */
exports.getLinksCategory_ExerciseControl = (req, res) => {

  getLinksCategory_Exercise({})
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    next(err);
  })
}
