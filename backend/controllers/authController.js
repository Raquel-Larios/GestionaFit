const {
  loginValidation,
  forgottenPassValidation,
} = require("../middleware/validation");
const { loginUser, forgottenPass } = require("../models/authModel");

exports.loginUserControl = (req, res, next) => {
  const { email, contraseña} = req.body;
  const params = {email, contraseña};

  const { error } = loginValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  loginUser(params)
    .then((result) => {
      const { statusCode = 200, message, data, token } = result;
      res.status(statusCode).send({ message, data, token });
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

exports.forgottenPassControl = (req, res, next) => {
  const {email}  = req.body;
  const params = {email};

  const {error} = forgottenPassValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  forgottenPass(params)
    .then((result) => {
      const { statusCode = 200, message, data} = result;
      res.status(statusCode).send({ message, data});
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data, code}) && next(err);
    });
};