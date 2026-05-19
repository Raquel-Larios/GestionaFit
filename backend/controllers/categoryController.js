const {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  linkCategoryToExerciseValidation,
} = require("../middleware/validation");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  linkCategoryToExercise,
  unlinkCategoryFormExercise,
} = require("../models/categoryModel");

//CREAR CATEGORÍA
exports.createCategoryControl = (req, res, next) => {
  const { nombre_categoria } = req.body;
  const params = {nombre_categoria}

  const { error } = createCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  createCategory(params)
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
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const params = {nombre_categoria, id_categoria}

  const { error } = updateCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  updateCategory(params)
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
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const params = {id_categoria}

  const { error } = deleteCategoryValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  deleteCategory(params)
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
exports.linkCategoryToExerciseControl = (req, res, next) => {
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  let { forceReplace } = req.body || {};
  const params = {id_categoria, id_ejercicio, forceReplace}

  const { error } = linkCategoryToExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  linkCategoryToExercise(params)
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
  const id_categoria = parseInt(req.params.id_categoria, 10);
  const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
  const params = {id_categoria, id_ejercicio}

  const { error } = linkCategoryToExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  unlinkCategoryFormExercise(params)
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
