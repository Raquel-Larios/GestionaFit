const express = require("express");
const router = express.Router();

const materialController = require("../controllers/materialController");

router.get("", (req, res) => {
    db.query('SELECT * FROM material', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", materialController.createMaterialControl);
router.put("/:materialId", materialController.updateMaterialControl);
router.delete("/:materialId", materialController.deleteMaterialControl);

module.exports = router;