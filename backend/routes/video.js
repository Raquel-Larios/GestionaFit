const express = require("express");
const router = express.Router();

const videoController = require("../controllers/videoController");

//GESTIÓN VÍDEO
router.get("", (req, res) => {
    db.query('SELECT * FROM video', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", videoController.createVideoControl);
router.put("/:videoId", videoController.updateVideoControl);
router.delete("/:videoId", videoController.deleteVideoControl);

//GESTIÓN ASIGNACIÓN VIDEO-EJERCICIO
router.get("/asignacion-video-ejercicio", (req, res) => {
    db.query('SELECT * FROM demostracion', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("/:videoId/:ejercicioId", videoController.linkVideoToExerciseControl);
router.delete("/desasignar/:videoId", videoController.unlinkVideoFromExercise)

module.exports = router;