const express = require("express");
const router = express.Router();
const db = require('../database/db');

const rutinaAdminController = require("../controllers/rutinaAdminController");

//ESTA ES LA RUTINA ASIGNADA AL CLIENTE QUE GESTIONA EL ADMIN
router.get("/all/:id_usuario", (req, res) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_historial', h.id,
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'variaciones', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', v2.id_ejercicio,
                                'repeticiones', v2.repeticiones,
                                'series', v2.series,
                                'carga', v2.carga,
                                'RPE', v2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM variacion v2
                        INNER JOIN ejercicio e2 ON v2.id_ejercicio = e2.id
                        WHERE v2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM variacion v3
                INNER JOIN ejercicio e3 ON v3.id_ejercicio = e3.id
                WHERE v3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id_usuario = ?
      AND EXISTS (SELECT 1 FROM variacion v WHERE v.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_usuario], (err, results) => {
        if (err) throw err;
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutinas no encontradas" });
        }
        res.json(results);
    });
});

router.get("/id-historial/:id_usuario/:id_plantilla", (req, res) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    const id_plantilla = parseInt(req.params.id_plantilla, 10)
    db.query('SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla= ?', [id_usuario, id_plantilla], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
})

router.get("/:id_historial", (req, res) => {
    const id_historial = parseInt(req.params.id_historial, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_historial', h.id,
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'variaciones', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', v2.id_ejercicio,
                                'repeticiones', v2.repeticiones,
                                'series', v2.series,
                                'carga', v2.carga,
                                'RPE', v2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM variacion v2
                        INNER JOIN ejercicio e2 ON v2.id_ejercicio = e2.id
                        WHERE v2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM variacion v3
                INNER JOIN ejercicio e3 ON v3.id_ejercicio = e3.id
                WHERE v3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id = ?
      AND EXISTS (SELECT 1 FROM variacion v WHERE v.id_historial = h.id)
    GROUP BY h.id, p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_historial], (err, results) => {
        if (err) throw err;
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }
        res.json(results[0].result);
    });
});

router.get("/asignaciones/por-plantilla/:id_plantilla", (req, res) => {
    const id_plantilla = parseInt(req.params.id_plantilla, 10);

    db.query("SELECT h.id_usuario, u.nombre, u.apellidos FROM historial_plantilla_usuario as h INNER JOIN usuario as u ON u.id = h.id_usuario WHERE h.id_plantilla = ?",
        [id_plantilla], 
        (err, results) => {
        if (err) throw err;
        res.json(results);
    });

});

router.get("/asignaciones/por-usuario/:id_usuario", (req, res) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);

    db.query("SELECT h.id_plantilla, p.nombre_plantilla, h.id_usuario FROM historial_plantilla_usuario as h INNER JOIN plantilla as p ON p.id = h.id_plantilla WHERE h.id_usuario = ?",
        [id_usuario], 
        (err, results) => {
        if (err) throw err;
        res.json(results);
    });

});

router.post("/:id_usuario/:id_plantilla", rutinaAdminController.createRutinaAdminControl);
router.put("/:id_historial", rutinaAdminController.updateRutinaAdminControl);
router.delete("/:id_historial", rutinaAdminController.deleteRutinaAdminControl);

module.exports = router;