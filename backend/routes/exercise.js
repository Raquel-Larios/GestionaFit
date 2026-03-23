const express = require("express");
const router = express.Router();
const db = require('../database/db');
const exerciseController = require("../controllers/exerciseController");
const categoryController = require("../controllers/categoryController");
const videoController = require("../controllers/videoController");

//GESTIÓN EJERCICIO
router.get("", (req, res) => {
    db.query('SELECT * FROM ejercicio ORDER BY nombre_ejercicio ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:ejercicioId", (req, res) => {
    const ejercicioId = parseInt(req.params.ejercicioId, 10);
    db.query('SELECT * FROM ejercicio WHERE id = ?', [ejercicioId], (err, results) => {
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