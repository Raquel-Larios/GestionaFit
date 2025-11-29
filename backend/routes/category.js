const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

//GESTIÓN CATEGORÍA
router.get("", (req, res) => {
    db.query('SELECT * FROM categoria', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", categoryController.createCategoryControl);
router.put("/:categoryId", categoryController.updateCategoryControl);
router.delete("/:categoryId", categoryController.deleteCategoryControl);

//GESIÓN ASIGNACIÓN CATEGORÍA-EJERCICIO
router.get("asignacion-categoria-ejercicio", categoryController.getLinksCategory_ExerciseControl);

router.post("/:categoriaId/:ejercicioId", categoryController.linkCategorytoExerciseControl);
router.delete("/:categoriaId/:ejercicioId", categoryController.unlinkCategoryFromExerciseControl);

module.exports = router;