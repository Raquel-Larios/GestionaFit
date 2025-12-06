const { createUser, updateUser, updateProfile, deleteUser, linkUserToTemplate, unlinkUserFromTemplate} = require("../models/userModel");

//CREAR CLIENTE (ADMIN ONLY)
exports.createUserControl = (req, res, next) => {
  const { email, nombre, apellidos, contraseña } = req.body;

  createUser({ email, nombre, apellidos, contraseña })
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
  const { userId } = req.params;
  const { email, nombre, apellidos} = req.body;

  updateUser({ userId, email, nombre, apellidos})
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
  const { userId } = req.params;
  const { email, nombre, apellidos, contraseña, foto_perfil, peso} = req.body;

  updateProfile({ userId, email, nombre, apellidos, contraseña, foto_perfil, peso})
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

//ELIMINAR CLIENTE
exports.deleteUserControl = (req, res, next) => {
  const { userId } = req.params;

  deleteUser({ userId })
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
  const { userId } = req.params.userId;
  const {plantillaId} = req.params.plantillaId;

  linkUserToTemplate({ userId, plantillaId })
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
  const { userId } = req.params.userId;
  const {plantillaId} = req.params.plantillaId;

  unlinkUserFromTemplate({ userId, plantillaId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};