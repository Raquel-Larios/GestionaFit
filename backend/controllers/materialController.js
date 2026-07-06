const {
  createMaterialValidation,
  updateMaterialValidation,
  deleteMaterialValidation,
} = require("../middleware/validation");
const {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../models/materialModel");

/**
 * Controlador para crear un nuevo material educativo.
 * 
 * Extrae los datos del cuerpo de la solicitud y valida el esquema.
 * Si la validación falla, lanza un error con estado 400.
 * Si tiene éxito, inserta el material en la base de datos.
 * 
 * @function createMaterialControl
 * @param {express.Request} req - Petición HTTP (body: { nombre_material, contenido }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía JSON con el material creado (200) o error de validación.
 * @throws {Object} Error personalizado (400) si la validación falla.
 */
exports.createMaterialControl = (req, res, next) => {
  const { nombre_material, contenido } = req.body;
  const params = {nombre_material, contenido}

  const { error } = createMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createMaterial(params)
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
 * Controlador para la actualización de materiales existentes.
 * 
 * Obtiene el ID de la URL y lo normaliza a entero para evitar errores de tipo.
 * Valida los nuevos datos antes de ejecutar la actualización en la base de datos.
 * 
 * @function updateMaterialControl
 * @param {express.Request} req - Petición HTTP (params: { id_material }, body: { nombre_material, contenido }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON (200 OK o 400 Bad Request).
 * @throws {Error} Lanza un objeto de error personalizado si la validación o el parseo del ID falla.
 */
exports.updateMaterialControl = (req, res, next) => {
  const { nombre_material, contenido } = req.body;
  // Normalización de tipos: Convierte id_material a entero para asegurar consistencia en la consulta SQL
  const id_material = parseInt(req.params.id_material, 10);
  const params = {nombre_material, contenido, id_material};

  const { error } = updateMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateMaterial(params)
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
 * Controlador para la eliminación lógica o física de materiales.
 * 
 * Extrae y valida el ID del material desde los parámetros de la ruta.
 * Ejecuta la operación de borrado delegando la lógica al modelo.
 * 
 * @function deleteMaterialControl
 * @param {express.Request} req - Petición HTTP (params: { id_material }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON (200 OK o 400/500 Error).
 * @throws {Error} Lanza un objeto de error personalizado si el ID es inválido o la validación falla.
 */
exports.deleteMaterialControl = (req, res, next) => {
  // Normalización de tipos: Asegura que el ID sea un entero válido antes de pasar al modelo
  const id_material = parseInt(req.params.id_material, 10);
  const params = {id_material}

  const { error } = deleteMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteMaterial(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};
