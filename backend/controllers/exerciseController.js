const {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  linkVideoValidation
} = require("../middleware/validation");
const {
  createExercise,
  updateExercise,
  deleteExercise,
  linkExerciseToVideo,
  unlinkExerciseFromVideo
} = require("../models/exerciseModel");

//CREAR EJERCICIO
exports.createExerciseControl = (req, res, next) => {
  const { nombre_ejercicio, id_categoria } = req.body;
  const params = {
  nombre_ejercicio,
  id_categoria: id_categoria ? parseInt(id_categoria, 10) : null
  };

  const { error } = createExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createExercise(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ACTUALIZAR EJERCICIO
exports.updateExerciseControl = (req, res, next) => {
  const { nombre_ejercicio, id_categoria } = req.body;
  const params = {
    nombre_ejercicio,
    id_categoria: id_categoria ? parseInt(id_categoria, 10) : null,
    id_ejercicio: parseInt(req.params.id_ejercicio, 10)
  }

  const { error } = updateExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateExercise(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ELIMINAR EJERCICIO
exports.deleteExerciseControl = (req, res, next) => {
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_ejercicio};

  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteExercise(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//CREAR ASIGNACIÓN EJERCICIO_VIDEO
exports.linkExerciseToVideoControl = (req, res, next) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    const id_video = parseInt(req.params.id_video, 10);
    let { forceReplace } = req.body || {};
    const params = {id_video, id_ejercicio, forceReplace}

    const { error } = linkVideoValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    linkExerciseToVideo(params)
    .then((result) => {
        const {statusCode = 200, message , data} = result;
        res.status(statusCode).send({message, data });
    })
    .catch((err) => {
        const {statusCode, message, data, code} = err;
        res.status(statusCode).send({ message, data, code}) && next(err);
    })
};

//ELIMINAR ASIGNACIÓN EJERCICIO-VIDEO
exports.unlinkExerciseFromVideoControl = (req, res, next) => {
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_ejercicio}

  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  unlinkExerciseFromVideo(params)
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
}