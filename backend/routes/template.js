const express = require("express");
const router = express.Router();

const templateController = require("../controllers/templateController");

//ESTE ES EL DE LA PLANTILLA QUE GESTIONA EL ADMIN
router.get("", (req, res) => {
    db.query('SELECT * FROM plantilla', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", templateController.createTemplateControl);
router.put("/:templateId", templateController.updateTemplateControl);
router.delete("/:templateId", templateController.deleteTemplateControl);

module.exports = router;