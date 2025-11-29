const Joi = require("joi");
const { unlinkExerciseFromVideo } = require("../models/exerciseModel");

var options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

//AUTH VALIDATIONS

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
    id: Joi.number().required().strict(),
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().min(8).required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
    peso: Joi.string().optional().allow(null),
    foto_perfil: Joi.string().optional().allow(null),
  });

  return schema.validate(data, options);
};

const deleteUserValidation = (data) => {
  const schema = Joi.object({
    id: Joi.number().required().strict(),
  });

  return schema.validate(data, options);
}

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

const deleteCategoryValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

const linkCategoryToExerciseValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    id: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

//EXERCISE VALIDATIONS
const createExerciseValidation = (data) => {
  const schema = Joi.object ({
    nombre_ejercicio: Joi.string().required().strict(),
    id_categoria: Joi.number().integer().optional().allow(null),
  })
  return schema.validate(data, options);
}

const updateExerciseValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    nombre_ejercicio: Joi.string().required().strict(),
    id_categoria: Joi.number().integer().optional().allow(null),
  })
  return schema.validate(data, options);
}

const deleteExerciseValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
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

const deleteMaterialValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
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

const deleteVideoValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

const linkVideoValidation = (data) => {
  const schema = Joi.object ({
    id: Joi.number().required().strict(),
    id: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

module.exports = {
  loginValidation,
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  linkCategoryToExerciseValidation,
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  createMaterialValidation,
  updateMaterialValidation,
  deleteMaterialValidation,
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation,
  linkVideoValidation,
};