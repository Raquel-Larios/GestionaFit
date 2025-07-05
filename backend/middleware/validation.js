const Joi = require("joi");

var options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

const registerValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().min(6).required().strict(),
  });

  return schema.validate(data, options);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().min(6).required().strict(),
  });

  return schema.validate(data, options);
};

const updateUserValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required().strict(),
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().min(6).required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
  });

  return schema.validate(data, options);
};

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
};