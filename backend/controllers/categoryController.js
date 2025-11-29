const {
  createCategory,
  updateCategory,
  deleteCategory,
  linkCategoryToExercise,
  unlinkCategoryFromExercise,
} = require("../models/categoryModel");

//CREAR CATEGORÍA
exports.createCategoryControl = (req, res, next) => {
  const { nombre } = req.body;

  createCategory({ nombre })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ACTUALIZAR CATEGORÍA
exports.updateCategoryControl = (req, res, next) => {
  const { nombre } = req.body;
  const categoriaId = req.params.id;

  updateCategory({ nombre, categoriaId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ELIMINAR CATEGORÍA
exports.deleteCategoryControl = (req, res, next) => {
  const categoriaId = req.params.id;

  deleteCategory({ categoriaId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ASIGNAR A EJERCICIO
exports.linkCategorytoExerciseControl = (req, res, next) => {
  const categoriaId = req.params.categoriaId;
  const ejercicioId = req.params.ejercicioId;

  linkCategoryToExercise({ categoriaId, ejercicioId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//ELIMINAR ASIGNACIÓN A EJERCICIO
exports.unlinkCategoryFromExerciseControl = (req, res, next) => {
  const categoriaId = req.params.categoriaId;
  const ejercicioId = req.params.ejercicioId;

  unlinkCategoryFromExercise({ categoriaId, ejercicioId })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode, message, data, code } = err;
      res.status(statusCode).send({ message, data, code }) && next(err);
    });
};

//GET ASIGNACIÓN CATEGORÍA-EJERCICIO O EJERCICIO-CATEGORÍA
exports.getLinksCategory_ExerciseControl = (req, res) => {

  this.getLinksCategory_Exercise({})
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    throw err;
  })
}
