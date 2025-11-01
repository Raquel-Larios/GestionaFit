const Joi = require("joi");

var options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

//AUTH VALIDATIONS
const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
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

//USER VALIDATIONS
const createUserValidation = (data) => {
  //Solo se usa al ser creados por el admin
  const schema = Joi.object({
    email: Joi.string().email().required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateUserValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.number().required().strict(),
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().min(6).required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
  });

  return schema.validate(data, options);
};

//TEMPLATE VALIDATIONS

//CATEGORY VALIDATIONS
const createCategoryValidation = (data) => {
  const schema = Joi.object ({
    nombre_categoria: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateCategoryValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    nombre_categoria: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

//EXERCISE VALIDATIONS
const createExerciseValidation = (data) => {
  const schema = Joi.object ({
    nombre_ejercicio: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateExerciseValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    nombre_ejercicio: Joi.string().required().strict(),
    id_categoria: Joi.number().strict(),
  })
  return schema.validate(data, options);
}

//MATERIAL VALIDATIONS
const createMaterialValidation = (data) => {
  const schema = Joi.object ({
    nombre_material: Joi.string().required().strict(),
    contenido: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateMaterialValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    nombre_material: Joi.string().required().strict(),
    contenido: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

//VIDEO VALIDATIONS
const createVideoValidation = (data) => {
  const schema = Joi.object ({
    nombre_video: Joi.string().required().strict(),
    enlace_video: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateVideoValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    nombre_video: Joi.string().required().strict(),
    enlace_video: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
  createCategoryValidation,
  updateCategoryValidation,
  createExerciseValidation,
  updateExerciseValidation,
  createMaterialValidation,
  updateMaterialValidation,
  createVideoValidation,
  updateVideoValidation,
};