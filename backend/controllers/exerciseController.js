const {
  createExercise,
  updateExercise,
  deleteExercise,
  unlinkExerciseFromVideo
} = require("../models/exerciseModel");

//CREAR EJERCICIO
exports.createExerciseControl = (req, res, next) => {
  const { nombre, categoriaId } = req.body;

  createExercise({ nombre, categoriaId })
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
  const { nombre, categoriaId } = req.body;
  const ejercicioId = req.params.id;

  updateExercise({ nombre, categoriaId, ejercicioId })
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
  const ejercicioId = req.params.id;

  deleteExercise({ ejercicioId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ELIMINAR ASIGNACIÓN EJERCICIO-VIDEO
exports.unlinkExerciseFromVideoControl = (req, res, next) => {
    const ejercicioId = req.params.id;

  unlinkExerciseFromVideo({ ejercicioId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
}