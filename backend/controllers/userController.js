const { createUserValidation, updateUserValidation, updateProfileValidation, updateProfilePhotoValidation, deleteUserValidation, linkUserToTemplateValidation } = require("../middleware/validation");
const { createUser, updateUser, updateProfile, updateProfilePhoto, deleteUser, linkUserToTemplate, unlinkUserFromTemplate} = require("../models/userModel");

//CREAR CLIENTE (ADMIN ONLY)
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

//ACTUALIZAR CLIENTE (ADMIN ONLY)
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

//ACTUALIZAR PERFIL
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

//ACTUALIZAR FOTO DE PERFIL
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

//ELIMINAR CLIENTE
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

//ASIGNAR A PLANTILLA
exports.linkUserToTemplateControl = (req, res, next) => {
  const { id_usuario, id_plantilla } = parseInt(req.params, 10);
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

//ELIMINAR ASIGNACIÓN A PLANTILLA
exports.unlinkUserFromTemplateControl = (req, res, next) => {
  const { id_usuario, id_plantilla} = parseInt(req.params, 10);
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