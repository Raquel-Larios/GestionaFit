const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");


router.get("/users", (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post("/users", (req, res) => {
    const { email, nombre, apellidos, contraseña } = req.body;
    db.query('INSERT INTO usuario (email, nombre, apellidos, contraseña) VALUES (?, ?, ?, ?)', [email, nombre, apellidos, contraseña], (err, results) => {
        if (err) throw err;
        res.status(201).json({ id: results.insertId, email, nombre, apellidos, contraseña });
    });
});

router.put("/:userId", userController.updateUserControl);

module.exports = router;