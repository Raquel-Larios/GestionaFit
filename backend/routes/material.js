const express = require("express");
const router = express.Router();
const db = require('../database/db');

const materialController = require("../controllers/materialController");

router.get("/all/antiguedad", (req, res) => {
    db.query('SELECT id, nombre_material, contenido FROM material ORDER BY id DESC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/all/nombre", (req, res) => {
    db.query('SELECT id, nombre_material, contenido FROM material ORDER BY nombre_material DESC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id_material", (req, res) => {
    const id_material = parseInt(req.params.id_material, 10);
    db.query('SELECT id, nombre_material, contenido FROM material WHERE id = ?', [id_material], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", materialController.createMaterialControl);
router.put("/:id_material", materialController.updateMaterialControl);
router.delete("/:id_material", materialController.deleteMaterialControl);

module.exports = router;