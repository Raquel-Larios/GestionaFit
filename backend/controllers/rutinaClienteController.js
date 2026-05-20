const {
  updateRutinaClienteValidation
} = require("../middleware/validation");
const { updateRutinaCliente } = require("../models/rutinaClienteModel");

//ACTUALIZAR PLANTILLA ASIGNADA AL USUARIO, SIN MODIFICAR EL DEFECTO
exports.updateRutinaClienteControl = (req, res, next) => {
  const id_historial = parseInt(req.params.id_historial, 10);
  const id_usuario = parseInt(req.params.id_usuario, 10);
  const { bloques } = req.body;
  const params = {id_historial, id_usuario, bloques}

  const { error } = updateRutinaClienteValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateRutinaCliente(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};