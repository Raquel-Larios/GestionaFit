const { createUserValidation, updateUserValidation, updateProfileValidation, updateProfilePhotoValidation, deleteUserValidation, linkUserToTemplateValidation } = require("../middleware/validation");
const { createUser, updateUser, updateProfile, updateProfilePhoto, deleteUser, linkUserToTemplate, unlinkUserFromTemplate} = require("../models/userModel");

/**
 * Controlador: Creación de nuevo cliente (Solo Admin).
 * 
 * Extrae los datos básicos del usuario (email, nombre, apellidos) del cuerpo de la solicitud.
 * Valida la integridad de los datos y delega la creación al modelo.
 * 
 * @function createUserControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.email - Correo electrónico del nuevo cliente.
 * @param {string} req.body.nombre - Nombre del cliente.
 * @param {string} req.body.apellidos - Apellidos del cliente.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la creación en el modelo.
 */
exports.createUserControl = (req, res, next) => {
  const { email, nombre, apellidos} = req.body;
  const params = {email, nombre, apellidos}

  const { error } = createUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createUser(params)
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
 * Controlador: Actualización de datos de cliente por Admin.
 * 
 * Obtiene el ID desde los parámetros y los datos actualizados del cuerpo.
 * Valida los nuevos datos y ejecuta la modificación del perfil.
 * 
 * @function updateUserControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del cliente a actualizar.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.email - Nuevo correo electrónico.
 * @param {string} req.body.nombre - Nuevo nombre.
 * @param {string} req.body.apellidos - Nuevos apellidos.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la actualización.
 */
exports.updateUserControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const { email, nombre, apellidos} = req.body;
  const params = {id_usuario, email, nombre, apellidos};

  const { error } = updateUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateUser({ id_usuario, email, nombre, apellidos})
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
 * Controlador: Actualización completa del perfil (Usuario o Admin).
 * 
 * Permite actualizar datos personales, credenciales (contraseña), peso y foto de perfil.
 * Valida exhaustivamente todos los campos permitidos antes de proceder.
 * 
 * @function updateProfileControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del usuario propietario del perfil.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} [req.body.email] - Nuevo correo.
 * @param {string} [req.body.nombre] - Nuevo nombre.
 * @param {string} [req.body.apellidos] - Nuevos apellidos.
 * @param {string} [req.body.contraseña] - Nueva contraseña (encriptada en modelo).
 * @param {number} [req.body.peso] - Nuevo peso corporal.
 * @param {string} [req.body.foto_perfil] - URL o ruta de la nueva foto.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la actualización.
 */
exports.updateProfileControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const { email, nombre, apellidos, contraseña, peso, foto_perfil} = req.body;
  const params = {id_usuario, email, nombre, apellidos, contraseña, peso, foto_perfil}

  const { error } = updateProfileValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateProfile(params)
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
 * Controlador: Actualización exclusiva de la foto de perfil.
 * 
 * Gestiona el cambio de la imagen de perfil separándolo de otros datos personales.
 * Valida que el cuerpo de la solicitud contenga únicamente los datos de la imagen.
 * 
 * @function updateProfilePhotoControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del usuario propietario.
 * @param {Object} req.body - Cuerpo de la solicitud (datos de la foto).
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la actualización.
 */
exports.updateProfilePhotoControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const foto_perfil = req.body;
  const params = {id_usuario, foto_perfil}

  const { error } = updateProfilePhotoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateProfilePhoto(params)
  .then((result) => {
    const {statusCode = 200, message, data } = result;
    res.status(statusCode).send({message, data});
  })
  .catch((err) => {
    const { statusCode, message, data , code} = err;
    res.status(statusCode).send({ message, data , code}) && next(err);
  });
};

/**
 * Controlador: Eliminación de cliente (Solo Admin).
 * 
 * Elimina permanentemente la cuenta de un usuario identificada por su ID.
 * Valida que el ID sea correcto antes de ejecutar la baja.
 * 
 * @function deleteUserControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del cliente a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la eliminación.
 */
exports.deleteUserControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const params = {id_usuario}

  const { error } = deleteUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteUser(params)
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
 * Controlador: Asignación de usuario a una plantilla.
 * 
 * Vincula un cliente con una plantilla de ejercicios específica.
 * Valida que ambos IDs existan y sean válidos.
 * 
 * @function linkUserToTemplateControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del usuario a asignar.
 * @param {number} req.params.id_plantilla - ID de la plantilla base.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la asignación.
 */
exports.linkUserToTemplateControl = (req, res, next) => {
  const id_usuario = parseInt(req.params, 10);
  const id_plantilla = parseInt(req.params, 10);
  const params = {id_usuario, id_plantilla}

  const { error } = linkUserToTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  linkUserToTemplate(params)
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
 * Controlador: Eliminación de asignación de plantilla a usuario.
 * 
 * Desvincula a un cliente de una plantilla específica sin borrar la plantilla ni el usuario.
 * Reutiliza la validación de asignación para asegurar la integridad de los IDs.
 * 
 * @function unlinkUserFromTemplateControl
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number} req.params.id_usuario - ID del usuario afectado.
 * @param {number} req.params.id_plantilla - ID de la plantilla a desvincular.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * 
 * @returns {void} Envía respuesta HTTP 200 o pasa error a next().
 * @rejects {Object} Lanza error 400 síncrono si la validación falla.
 * @rejects {Object} Pasa error asíncrono si falla la desvinculación.
 */
exports.unlinkUserFromTemplateControl = (req, res, next) => {
  const id_usuario = parseInt(req.params, 10);
  const id_plantilla = parseInt(req.params, 10);
  const params = {id_usuario, id_plantilla}

  const { error } = linkUserToTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  unlinkUserFromTemplate(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};