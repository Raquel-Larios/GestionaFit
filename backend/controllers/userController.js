const { createUser, updateUser, updateProfile, updateProfilePhoto, deleteUser, linkUserToTemplate, unlinkUserFromTemplate} = require("../models/userModel");

//CREAR CLIENTE (ADMIN ONLY)
exports.createUserControl = (req, res, next) => {
  const { email, nombre, apellidos} = req.body;

  createUser({ email, nombre, apellidos})
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

  updateProfile({ id_usuario, email, nombre, apellidos, contraseña, peso, foto_perfil})
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

  updateProfilePhoto({ id_usuario, foto_perfil})
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

  deleteUser({ id_usuario })
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


  linkUserToTemplate({ id_usuario, id_plantilla })
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


  unlinkUserFromTemplate({ id_usuario, id_plantilla })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};