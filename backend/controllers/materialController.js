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

exports.updateMaterialControl = (req, res, next) => {
  const { nombre_material, contenido } = req.body;
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

exports.deleteMaterialControl = (req, res, next) => {
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
