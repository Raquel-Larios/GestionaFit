const express = require("express");
const router = express.Router();
const db = require('../database/db');
const categoryController = require("../controllers/categoryController");

//GESTIÓN CATEGORÍA
router.get("/all", (req, res) => {
    db.query('SELECT id, nombre_categoria FROM categoria ORDER BY nombre_categoria ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id_categoria", (req, res) => {
    const id_categoria = parseInt(req.params.id_categoria, 10);
    db.query('SELECT * FROM categoria WHERE id = ?', [id_categoria], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

router.post("", categoryController.createCategoryControl);
router.put("/:id_categoria", categoryController.updateCategoryControl);
router.delete("/:id_categoria", categoryController.deleteCategoryControl);

//GESIÓN ASIGNACIÓN CATEGORÍA-EJERCICIO
router.get("/asignacion-categoria-ejercicio", categoryController.getLinksCategory_ExerciseControl);
router.get("/asignacion-categoria-ejercicio/:id_categoria", (req, res) => {
    const id_categoria = parseInt(req.params.id_categoria, 10);
    db.query('SELECT ejercicio.id, ejercicio.nombre_ejercicio FROM ejercicio INNER JOIN categoria ON ejercicio.id_categoria = categoria.id WHERE id_categoria = ? ORDER BY ejercicio.nombre_ejercicio', [id_categoria], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})
router.post("/asignar/:id_categoria/:id_ejercicio", categoryController.linkCategorytoExerciseControl);
router.delete("/desasignar/:id_categoria/:id_ejercicio", categoryController.unlinkCategoryFromExerciseControl);

module.exports = router;