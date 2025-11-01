const { updateUser } = require("../models/userModel");

exports.updateUserControl = async (req, res, next) => {
  const { userId } = req.params;
  const { nombre, apellidos, email, contraseña } = req.body;

  //Invoca al método del modelo y dependiendo del resultado lanza la respuesta HTTP

  updateUser({ userId, nombre, apellidos, email, contraseña })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};