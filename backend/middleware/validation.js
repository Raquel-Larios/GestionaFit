const Joi = require("joi");

var options = {
  errors: {
    wrap: {
      label: false,
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

const forgottenPassValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().strict(),
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
    id_usuario: Joi.number().required().strict(),
    email: Joi.string().email().required().strict(),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
  });

  return schema.validate(data, options);
};

const updateProfileValidation = (data) => {
  const schema = Joi.object({
    id_usuario: Joi.number().required().strict(),
    email: Joi.string().email().required().strict(),
    contraseña: Joi.string().empty('').allow(null).optional().min(8),
    nombre: Joi.string().required().strict(),
    apellidos: Joi.string().required().strict(),
    peso: Joi.number().empty('').optional().allow(null),
    foto_perfil: Joi.string().empty('').optional().allow(null),
  });

  return schema.validate(data, options);
};

const updateProfilePhotoValidation = (data) => {
const schema = Joi.object({
    id_usuario: Joi.number().required().strict(),
    foto_perfil: Joi.string().required().strict(),
  });

  return schema.validate(data, options);
};

const deleteUserValidation = (data) => {
  const schema = Joi.object({
    id_usuario: Joi.number().required().strict(),
  });

  return schema.validate(data, options);
}

const linkUserToTemplateValidation = (data) => {
  const schema = Joi.object({
    id_usuario: Joi.number().required().strict(),
    id_plantilla: Joi.number().required().strict(),
  });

  return schema.validate(data, options);
}

//TEMPLATE VALIDATIONS
const createTemplateValidation = (data) => {
  const schema = Joi.object({
    nombre_plantilla: Joi.string().required(),
    bloques: Joi.array().items(
      Joi.object({
        id_categoria: Joi.alternatives().try(
          Joi.number().integer().positive(),
          Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
        ).required(),
        defectos: Joi.array().items(
          Joi.object({
            id_ejercicio: Joi.alternatives().try(
              Joi.number().integer().positive(),
              Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
            ).required(),
            series: Joi.number().integer().min(0).required(),
            repeticiones: Joi.number().integer().min(0).required(),
            carga: Joi.number().min(0).required(),
            RPE: Joi.number().integer().min(1).max(10).required(),
            nombre_ejercicio: Joi.string().allow("")
          }).required()
        ).required()
      }).required()
    ).required()
  });

  return schema.validate(data);
};

const updateTemplateValidation = (data) => {
  const schema = Joi.object ({
    id_plantilla: Joi.number().required().strict(),
    nombre_plantilla: Joi.string().required(),
    bloques: Joi.array().items(
      Joi.object({
        id_categoria: Joi.alternatives().try(
          Joi.number().integer().min(0),
          Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
        ).required(),
        defectos: Joi.array().items(
          Joi.object({
            id_ejercicio: Joi.alternatives().try(
              Joi.number().integer().positive(),
              Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
            ).required(),
            series: Joi.number().integer().min(0).required(),
            repeticiones: Joi.number().integer().min(0).required(),
            carga: Joi.number().min(0).required(),
            RPE: Joi.number().integer().min(1).max(10).required(),
            nombre_ejercicio: Joi.string().allow("")
          }).required()
        ).required()
      }).required()
    ).required()
  });


  return schema.validate(data, options);
}

const deleteTemplateValidation = (data) => {
  const schema = Joi.object ({
    id_plantilla: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

//RUTINA-ADMIN VALIDATIONS
const createRutinaAdminValidation = (data) => {
  const schema = Joi.object({
    id_usuario: Joi.number().required().strict(),
    id_plantilla: Joi.number().required().strict(),
  });

  return schema.validate(data);
};

const updateRutinaAdminValidation = (data) => {
  const schema = Joi.object ({
    id_historial: Joi.number().required().strict(),
    bloques: Joi.array().items(
      Joi.object({
        id_categoria: Joi.alternatives().try(
          Joi.number().integer().min(0),
          Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
        ).required(),
        variaciones: Joi.array().items(
          Joi.object({
            id_ejercicio: Joi.alternatives().try(
              Joi.number().integer().positive(),
              Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
            ).required(),
            series: Joi.number().integer().min(0).required(),
            repeticiones: Joi.number().integer().min(0).required(),
            carga: Joi.number().min(0).required(),
            RPE: Joi.number().integer().min(1).max(10).required(),
            nombre_ejercicio: Joi.string().allow("")
          }).required()
        ).required()
      }).required()
    ).required()
  });


  return schema.validate(data, options);
}

const deleteRutinaAdminValidation = (data) => {
  const schema = Joi.object ({
    id_historial: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

//RUTINA-CLIENTE VALIDATIONS
const updateRutinaClienteValidation = (data) => {
  const schema = Joi.object ({
    id_historial: Joi.number().required().strict(),
    id_usuario: Joi.number().required().strict(),
    bloques: Joi.array().items(
      Joi.object({
        id_categoria: Joi.alternatives().try(
          Joi.number().integer().min(0),
          Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
        ).required(),
        lecturas: Joi.array().items(
          Joi.object({
            id_ejercicio: Joi.alternatives().try(
              Joi.number().integer().positive(),
              Joi.string().pattern(/^[0-9]+$/).custom(value => parseInt(value, 10))
            ).required(),
            series: Joi.number().integer().min(0).required(),
            repeticiones: Joi.number().integer(0).min(0).required(),
            carga: Joi.number().min(0).required(),
            RPE: Joi.number().integer().min(1).max(10).required(),
            nombre_ejercicio: Joi.string().allow("")
          }).required()
        ).required()
      }).required()
    ).required()
  });


  return schema.validate(data, options);
}

//CATEGORY VALIDATIONS
const createCategoryValidation = (data) => {
  const schema = Joi.object ({
    nombre_categoria: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const updateCategoryValidation = (data) => {
  const schema = Joi.object ({
    id_categoria: Joi.number().required().strict(),
    nombre_categoria: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const deleteCategoryValidation = (data) => {
  const schema = Joi.object ({
    id_categoria: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

const linkCategoryToExerciseValidation = (data) => {
  const schema = Joi.object ({
    id_categoria: Joi.number().required().strict(),
    id_ejercicio: Joi.number().required().strict(),
    forceReplace: Joi.boolean().empty('').optional().allow(null),
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
    id_ejercicio: Joi.number().required().strict(),
    nombre_ejercicio: Joi.string().required().strict(),
    id_categoria: Joi.number().integer().optional().allow(null),
  })
  return schema.validate(data, options);
}

const deleteExerciseValidation = (data) => {
  const schema = Joi.object ({
    id_ejercicio: Joi.number().required().strict(),
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
    id_material: Joi.number().required().strict(),
    nombre_material: Joi.string().required().strict(),
    contenido: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const deleteMaterialValidation = (data) => {
  const schema = Joi.object ({
    id_material: Joi.number().required().strict(),
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
    id_video: Joi.number().required().strict(),
    nombre_video: Joi.string().required().strict(),
    enlace_video: Joi.string().required().strict(),
  })
  return schema.validate(data, options);
}

const deleteVideoValidation = (data) => {
  const schema = Joi.object ({
    id_video: Joi.number().required().strict(),
  })
  return schema.validate(data, options);
}

const linkVideoValidation = (data) => {
  const schema = Joi.object ({
    id_video: Joi.number().required().strict(),
    id_ejercicio: Joi.number().required().strict(),
    forceReplace: Joi.boolean().empty('').optional().allow(null),
  })
  return schema.validate(data, options);
}

module.exports = {
  //login
  loginValidation,
  forgottenPassValidation,
  //user
  createUserValidation,
  updateUserValidation,
  updateProfileValidation,
  updateProfilePhotoValidation,
  deleteUserValidation,
  linkUserToTemplateValidation,
  //template
  createTemplateValidation,
  updateTemplateValidation,
  deleteTemplateValidation,
  //rutinaAdmin
  createRutinaAdminValidation,
  updateRutinaAdminValidation,
  deleteRutinaAdminValidation,
  //rutinaCliente
  updateRutinaClienteValidation,
  //categoria
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  linkCategoryToExerciseValidation,
  //ejercicio
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  //material
  createMaterialValidation,
  updateMaterialValidation,
  deleteMaterialValidation,
  //video
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation,
  linkVideoValidation,

};