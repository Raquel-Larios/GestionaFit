const { loginUser } = require("../models/authModel");

exports.loginUserControl = async (req, res, next) => {
  const { email, contraseña} = req.body;

  loginUser({ email, contraseña })
    .then((result) => {
      console.log(result);
      const { statusCode = 200, message, data, token } = result;
      res.status(statusCode).send({ message, data, token });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};