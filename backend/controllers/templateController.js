const {
  createTemplateValidation,
  updateTemplateValidation,
  deleteTemplateValidation,
  createRutinaAdminValidation
} = require("../middleware/validation");
const { createTemplate, updateTemplate, deleteTemplate, deleteRutinaPlantilla} = require("../models/templateModel");

//CREAR PLANTILLA DEL ADMIN
exports.createTemplateControl = (req, res, next) => {
  const { nombre_plantilla, bloques} = req.body;
  const params = {nombre_plantilla, bloques}

  const { error } = createTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createTemplate(params)
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
  const params = {id_plantilla, nombre_plantilla, bloques}

  const { error } = updateTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };
    

  updateTemplate(params)
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
  const params = {id_plantilla}

  const { error } = deleteTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteTemplate(params)
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
exports.deleteRutinaPlantillaControl = (req, res, next) => {
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const id_plantilla = parseInt(req.params.id_plantilla, 10);
  const params = {id_usuario, id_plantilla};

  const { error } = createRutinaAdminValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteRutinaPlantilla(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};
