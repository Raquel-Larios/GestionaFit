const express = require("express");
const router = express.Router();
const db = require('../database/db');

const rutinaClienteController = require("../controllers/rutinaClienteController");

//ESTA ES LA RUTINA QUE VE Y RELLENA EL CLIENTE, SOLO LOS CAMPOS RELLENABLES
//Get los datos de todas las rutinas
router.get("/:id_usuario/all", (req, res) => {
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
                    'lecturas', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', l2.id_ejercicio,
                                'repeticiones', l2.repeticiones,
                                'series', l2.series,
                                'carga', l2.carga,
                                'RPE', l2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM lectura l2
                        INNER JOIN ejercicio e2 ON l2.id_ejercicio = e2.id
                        WHERE l2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM lectura l3
                INNER JOIN ejercicio e3 ON l3.id_ejercicio = e3.id
                WHERE l3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id_usuario = ?
      AND EXISTS (SELECT 1 FROM lectura l WHERE l.id_historial = h.id)
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

//Get id_historial a partir de los ids de usuario y plantilla
router.get("/id-historial/:id_usuario/:id_plantilla", (req, res) => {
    const id_usuario = parseInt(req.params.id_usuario, 10);
    const id_plantilla = parseInt(req.params.id_plantilla, 10)
    db.query('SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla= ?', [id_usuario, id_plantilla], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
})

//Get los datos de una única rutina
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
                    'lecturas', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', l2.id_ejercicio,
                                'repeticiones', l2.repeticiones,
                                'series', l2.series,
                                'carga', l2.carga,
                                'RPE', l2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM lectura l2
                        INNER JOIN ejercicio e2 ON l2.id_ejercicio = e2.id
                        WHERE l2.id_historial = h.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM lectura l3
                INNER JOIN ejercicio e3 ON l3.id_ejercicio = e3.id
                WHERE l3.id_historial = h.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM historial_plantilla_usuario h
    INNER JOIN plantilla p ON h.id_plantilla = p.id
    WHERE h.id = ?
      AND EXISTS (SELECT 1 FROM lectura l WHERE l.id_historial = h.id)
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

router.put("/:id_usuario/:id_historial", rutinaClienteController.updateRutinaClienteControl);

module.exports = router;