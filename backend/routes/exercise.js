const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exerciseController");
const categoryController = require("../controllers/categoryController");
const videoController = require("../controllers/videoController");

//GESTIÓN EJERCICIO
router.get("", (req, res) => {
    db.query('SELECT * FROM ejercicio', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", exerciseController.createExerciseControl);
router.put("/:ejercicioId", exerciseController.updateExerciseControl);
router.delete("/:ejercicioId", exerciseController.deleteExerciseControl);

//GESTIÓN ASIGNACIÓN EJERCICIO-CATEGORÍA
router.get("asignacion-ejercicio-categoria", categoryController.getLinksCategory_ExerciseControl);

router.post("/:ejercicioId/:categoriaId", categoryController.linkCategorytoExerciseControl);
router.delete("/:ejercicioId/:categoriaId", categoryController.unlinkCategoryFromExerciseControl);
//GESTIÓN ASIGNACIÓN EJERCICIO-VÍDEO
router.get("asignacion-ejericio-video", videoController.getLinksVideo_ExerciseControl);
router.post("/:ejercicioId/:videoId", videoController.linkVideoToExerciseControl);
router.delete("/desasignar/:ejercicioId", exerciseController.unlinkExerciseFromVideoControl);

module.exports = router;