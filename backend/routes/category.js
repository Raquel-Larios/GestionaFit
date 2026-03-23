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

router.get("/:categoriaId", (req, res) => {
    const categoriaId = parseInt(req.params.categoriaId, 10);
    db.query('SELECT * FROM categoria WHERE id = ?', [categoriaId], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

router.post("", categoryController.createCategoryControl);
router.put("/:id_categoria", categoryController.updateCategoryControl);
router.delete("/:id", categoryController.deleteCategoryControl);

//GESIÓN ASIGNACIÓN CATEGORÍA-EJERCICIO
router.get("asignacion-categoria-ejercicio", categoryController.getLinksCategory_ExerciseControl);
router.post("/:id_categoria/:id_ejercicio", categoryController.linkCategorytoExerciseControl);
router.delete("/:id_categoria/:id_ejercicio", categoryController.unlinkCategoryFromExerciseControl);

module.exports = router;