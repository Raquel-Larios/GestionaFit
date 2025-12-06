const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");
const templateController = require("../controllers/templateController");


router.get("", (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", userController.createUserControl);
router.put("/:userId", userController.updateUserControl);
router.put("/:userId/profile", userController.updateProfileControl);
router.delete("/:userId", userController.deleteUserControl);

//GESTIÓN ASIGNACIÓN A PLANTILLA
router.get("/:userId/:plantillaId", templateController.getUserTemplatesControl);
router.put("/:userId/:plantillaId", userController.linkUserToTemplateControl);
router.delete("/:userId/:plantillaId", userController.unlinkUserFromTemplateControl);

module.exports = router;