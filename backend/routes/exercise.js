const express = require("express");
const router = express.Router();
const db = require('../database/db');
const exerciseController = require("../controllers/exerciseController");
const categoryController = require("../controllers/categoryController");
const videoController = require("../controllers/videoController");

//GESTIÓN EJERCICIO
router.get("/all/nombre", (req, res) => {
    db.query('SELECT id, nombre_ejercicio, id_categoria FROM ejercicio ORDER BY nombre_ejercicio ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/all/by-categoria", (req, res) => {
    db.query('SELECT ejercicio.id, nombre_ejercicio, ejercicio.id_categoria, nombre_categoria FROM ejercicio LEFT JOIN categoria ON ejercicio.id_categoria = categoria.id ORDER BY nombre_categoria IS NULL, nombre_categoria, nombre_ejercicio ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id_ejercicio", (req, res) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT id, nombre_ejercicio, id_categoria FROM ejercicio WHERE id = ?', [id_ejercicio], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

router.post("", exerciseController.createExerciseControl);
router.put("/:id_ejercicio", exerciseController.updateExerciseControl);
router.delete("/:id_ejercicio", exerciseController.deleteExerciseControl);

//GESTIÓN ASIGNACIÓN EJERCICIO-CATEGORÍA
router.get("asignacion-ejercicio-categoria", categoryController.getLinksCategory_ExerciseControl);

router.post("/:id_ejercicio/:id_categoria", categoryController.linkCategorytoExerciseControl);
router.delete("/:id_ejercicio/:id_categoria", categoryController.unlinkCategoryFromExerciseControl);
//GESTIÓN ASIGNACIÓN EJERCICIO-VÍDEO
router.get("asignacion-ejericio-video", videoController.getLinksVideo_ExerciseControl);
router.post("/:id_ejercicio/:id_video", videoController.linkVideoToExerciseControl);
router.delete("/desasignar/:id_ejercicio", exerciseController.unlinkExerciseFromVideoControl);

module.exports = router;