const { createTemplate, updateTemplate, deleteTemplate} = require("../models/templateModel");

//CREAR PLANTILLA DEL ADMIN
exports.createTemplateControl = (req, res, next) => {
  const { nombre_plantilla, bloques} = req.body;

  createTemplate({ nombre_plantilla, bloques})
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

//ACTUALIZAR PLANTILLA DEL ADMIN
exports.updateTemplateControl = (req, res, next) => {
  const id_plantilla = parseInt(req.body.id, 10);
  const { nombre_plantilla, bloques} = req.body;

  updateTemplate({ id_plantilla, nombre_plantilla, bloques})
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

//ELIMINAR PLANTILLA DEL ADMIN
exports.deleteTemplateControl = (req, res, next) => {
  const id_plantilla = parseInt(req.params.id_plantilla, 10);

  deleteTemplate({ id_plantilla })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

