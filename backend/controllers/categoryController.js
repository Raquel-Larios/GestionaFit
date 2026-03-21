const {
  createCategory,
  updateCategory,
  deleteCategory,
  linkCategoryToExercise,
  unlinkCategoryFromExercise,
} = require("../models/categoryModel");

//CREAR CATEGORÍA
exports.createCategoryControl = (req, res, next) => {
  const { nombre_categoria } = req.body;

  createCategory({nombre_categoria})
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
  const { nombre_categoria } = req.body;
  const id = parseInt(req.params.id, 10);

  updateCategory({ nombre_categoria, id })
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
  const id = parseInt(req.params.id, 10);

  deleteCategory({ id })
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
  const {categoriaId, ejercicioId} = req.params;

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
   const {categoriaId, ejercicioId} = req.params;

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
