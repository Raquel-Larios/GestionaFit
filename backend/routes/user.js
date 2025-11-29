const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");


router.get("", (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("", userController.createUserControl);
router.put("/:userId", userController.updateUserControl);
router.delete("/:userId", userController.deleteUserControl);

module.exports = router;