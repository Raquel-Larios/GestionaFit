const express = require("express");
const router = express.Router();
const db = require('../database/db');
const exerciseController = require("../controllers/exerciseController");
const categoryController = require("../controllers/categoryController");
const videoController = require("../controllers/videoController");

//GESTIÓN EJERCICIO
router.get("/all", (req, res) => {
  const { by_categoria } = req.query;

  let query = 'SELECT ejercicio.id, nombre_ejercicio';
  
  if (by_categoria) {
    query += ', ejercicio.id_categoria, nombre_categoria FROM ejercicio LEFT JOIN categoria ON ejercicio.id_categoria = categoria.id ORDER BY nombre_categoria IS NULL, nombre_categoria, nombre_ejercicio ASC';
  } else {
    query += ', id_categoria FROM ejercicio ORDER BY nombre_ejercicio ASC';
  }

  db.query(query, (err, results) => {
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
router.get("/asignacion-ejercicio-categoria/:id_ejercicio", (req, res) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT categoria.id, categoria.nombre_categoria FROM categoria INNER JOIN ejercicio ON categoria.id = ejercicio.id_categoria WHERE ejercicio.id = ? ORDER BY categoria.nombre_categoria', [id_ejercicio], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})
router.post("/asignacion-ejercicio-categoria/asignar/:id_ejercicio/:id_categoria", categoryController.linkCategoryToExerciseControl);
router.delete("/asignacion-ejercicio-categoria/desasignar/:id_ejercicio/:id_categoria", categoryController.unlinkCategoryFromExerciseControl);
//GESTIÓN ASIGNACIÓN EJERCICIO-VÍDEO
router.get("/asignacion-ejercicio-video", videoController.getLinksVideo_ExerciseControl);
router.get("/asignacion-ejercicio-video/:id_ejercicio", (req, res) => {
    const id_ejercicio = parseInt(req.params.id_ejercicio, 10);
    db.query('SELECT demostracion.id_video, video.nombre_video FROM demostracion INNER JOIN video ON demostracion.id_video = video.id WHERE demostracion.id_ejercicio = ? ORDER BY video.nombre_video', [id_ejercicio], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
});
router.post("/asignacion-ejercicio-video/asignar/:id_ejercicio/:id_video", exerciseController.linkExerciseToVideoControl);
router.delete("/asignacion-ejercicio-video/desasignar/:id_ejercicio", exerciseController.unlinkExerciseFromVideoControl);

module.exports = router;