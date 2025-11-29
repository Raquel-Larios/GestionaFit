const { loginUser } = require("../models/authModel");

exports.loginUserControl = (req, res, next) => {
  const { email, contraseña} = req.body;

  loginUser({ email, contraseña })
    .then((result) => {
      const { statusCode = 200, message, data, token } = result;
      res.status(statusCode).send({ message, data, token });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};