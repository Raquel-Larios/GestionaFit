const {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../models/materialModel");

exports.createMaterialControl = (req, res, next) => {
  const { nombre, contenido } = req.body;

  createMaterial({ nombre, contenido })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

exports.updateMaterialControl = (req, res, next) => {
  const { nombre, contenido } = req.body;
  const materialId = req.params.id;

  updateMaterial({ nombre, contenido, materialId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

exports.deleteMaterialControl = (req, res, next) => {
  const materialId = req.params.id;

  deleteMaterial({ materialId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};
