const {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../models/materialModel");

exports.createMaterialControl = (req, res, next) => {
  const { nombre_material, contenido } = req.body;

  createMaterial({ nombre_material, contenido })
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
  const { nombre_material, contenido } = req.body;
  const id_material = parseInt(req.params.id_material, 10);

  updateMaterial({ nombre_material, contenido, id_material })
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
  const id_material = parseInt(req.params.id_material, 10);

  deleteMaterial({ id_material })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};
