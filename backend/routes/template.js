const express = require("express");
const router = express.Router();
const db = require("../database/db");

const templateController = require("../controllers/templateController");

//ESTA ES LA PLANTILLA QUE GESTIONA EL ADMIN ANTES DE SER ASIGNADA
router.get("/all", (req, res) => {
    const { by_antiguedad } = req.query;

    let query = `SELECT 
    JSON_OBJECT(
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'defectos', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', d2.id_ejercicio,
                                'repeticiones', d2.repeticiones,
                                'series', d2.series,
                                'carga', d2.carga,
                                'RPE', d2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM defecto d2
                        INNER JOIN ejercicio e2 ON d2.id_ejercicio = e2.id
                        WHERE d2.id_plantilla = p.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM defecto d3
                INNER JOIN ejercicio e3 ON d3.id_ejercicio = e3.id
                WHERE d3.id_plantilla = p.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM plantilla p
    WHERE EXISTS (SELECT 1 FROM defecto d WHERE d.id_plantilla = p.id)
    GROUP BY p.id, p.nombre_plantilla
                    ORDER BY `;

    if (by_antiguedad) {
        query += "p.id DESC;";
    } else {
        query += "p.nombre_plantilla ASC;";
    }

    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id_plantilla", (req, res) => {
    const id_plantilla = parseInt(req.params.id_plantilla, 10);
    let query = `SELECT 
    JSON_OBJECT(
        'id_plantilla', p.id,
        'nombre_plantilla', p.nombre_plantilla,
        'bloques', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id_categoria', c.id,
                    'nombre_categoria', c.nombre_categoria,
                    'defectos', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id_ejercicio', d2.id_ejercicio,
                                'repeticiones', d2.repeticiones,
                                'series', d2.series,
                                'carga', d2.carga,
                                'RPE', d2.RPE,
                                'nombre_ejercicio', e2.nombre_ejercicio
                            )
                        )
                        FROM defecto d2
                        INNER JOIN ejercicio e2 ON d2.id_ejercicio = e2.id
                        WHERE d2.id_plantilla = p.id 
                          AND e2.id_categoria = c.id
                    )
                )
            )
            FROM categoria c
            WHERE EXISTS (
                SELECT 1 
                FROM defecto d3
                INNER JOIN ejercicio e3 ON d3.id_ejercicio = e3.id
                WHERE d3.id_plantilla = p.id 
                  AND e3.id_categoria = c.id
            )
        )
    ) AS result
    FROM plantilla p
    WHERE p.id = ?
      AND EXISTS (SELECT 1 FROM defecto d WHERE d.id_plantilla = p.id)
    GROUP BY p.id, p.nombre_plantilla
    ORDER BY p.nombre_plantilla ASC;`;

    db.query(query, [id_plantilla], (err, results) => {
        if (err) throw err;
        if (results.length === 0 || results[0].result === null) {
            return res.status(404).json({ message: "Plantilla no encontrada" });
        }
        res.json(results[0].result);
    });
});
router.post("", templateController.createTemplateControl);
router.put("/:id_plantilla", templateController.updateTemplateControl);
router.delete("/:id_plantilla", templateController.deleteTemplateControl);

router.delete("/:id_usuario/:id_plantilla", templateController.deleteRutinaPlantillaControl);

module.exports = router;
