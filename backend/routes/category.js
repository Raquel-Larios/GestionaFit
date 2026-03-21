const express = require("express");
const router = express.Router();
const db = require('../database/db');
const categoryController = require("../controllers/categoryController");

//GESTIÓN CATEGORÍA
router.get("", (req, res) => {
    db.query('SELECT * FROM categoria ORDER BY nombre_categoria ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.query('SELECT * FROM categoria WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

router.post("", categoryController.createCategoryControl);
router.put("/:id", categoryController.updateCategoryControl);
router.delete("/:id", categoryController.deleteCategoryControl);

//GESIÓN ASIGNACIÓN CATEGORÍA-EJERCICIO
router.get("asignacion-categoria-ejercicio", categoryController.getLinksCategory_ExerciseControl);
router.post("/:categoriaId/:ejercicioId", categoryController.linkCategorytoExerciseControl);
router.delete("/:categoriaId/:ejercicioId", categoryController.unlinkCategoryFromExerciseControl);

module.exports = router;