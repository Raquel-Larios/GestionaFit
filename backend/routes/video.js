const express = require("express");
const router = express.Router();
const db = require('../database/db');

const videoController = require("../controllers/videoController");

//GESTIÓN VÍDEO
router.get("/all/antiguedad", (req, res) => {
    db.query('SELECT id, nombre_video, enlace_video FROM video ORDER BY id DESC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/all/nombre", (req, res) => {
    db.query('SELECT id, nombre_video, enlace_video FROM video ORDER BY nombre_video ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id_video", (req, res) => {
    const id_video = parseInt(req.params.id_video, 10);
    db.query('SELECT id, nombre_video, enlace_video FROM video WHERE id = ?', [id_video], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", videoController.createVideoControl);
router.put("/:id_video", videoController.updateVideoControl);
router.delete("/:id_video", videoController.deleteVideoControl);

//GESTIÓN ASIGNACIÓN VIDEO-EJERCICIO
router.get("/asignacion-video-ejercicio", (req, res) => {
    db.query('SELECT * FROM demostracion', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
router.get("/asignacion-video-ejercicio/:id_video", (req, res) => {
    const id_video = parseInt(req.params.id_video, 10);
    db.query('SELECT demostracion.id_ejercicio, ejercicio.nombre_ejercicio FROM demostracion INNER JOIN ejercicio ON demostracion.id_ejercicio = ejercicio.id WHERE demostracion.id_video = ? ORDER BY ejercicio.nombre_ejercicio', [id_video], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})
router.post("/asignar/:id_video/:id_ejercicio", videoController.linkVideoToExerciseControl);
router.delete("/desasignar/:id_video", videoController.unlinkVideoFromExerciseControl);

module.exports = router;