const {
  createRutinaAdminValidation,
  updateRutinaAdminValidation,
  deleteRutinaAdminValidation
} = require("../middleware/validation");
const { createRutinaAdmin, updateRutinaAdmin, deleteRutinaAdmin} = require("../models/rutinaAdminModel");

//ASIGNAR PLANTILLA A USUARIO
exports.createRutinaAdminControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const id_plantilla = parseInt(req.params.id_plantilla, 10);
  const params = {id_usuario, id_plantilla};

  const { error } = createRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

//ACTUALIZAR PLANTILLA ASIGNADA AL USUARIO, SIN MODIFICAR EL DEFECTO
exports.updateRutinaAdminControl = (req, res, next) => {
  const id_historial = parseInt(req.params.id_historial, 10);
  const { bloques } = req.body;
  const params = {id_historial, bloques}

  const { error } = updateRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

//ELIMINAR ASIGNACIÓN PLANTILLA-USUARIO
exports.deleteRutinaAdminControl = (req, res, next) => {
  const id_historial = parseInt(req.params.id_historial, 10);
  const params = {id_historial};

  const { error } = deleteRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteRutinaAdmin(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

