const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");
const templateController = require("../controllers/templateController");


router.get("/clientes", (req, res) => {
    db.query('SELECT id, nombre, apellidos, email FROM usuario WHERE rol = 0', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:userId/datos", (req, res) =>{
    db.query('SELECT id, email, nombre, apellidos, contraseña, isPassGenerated, foto_perfil, peso FROM usuario WHERE id = ? AND rol = 0', [req.params.userId], (err, results) => {
        if(err) throw err;
        res.json(results);
    })
})

router.post("/clientes", userController.createUserControl);
router.put("/clientes/:userId", userController.updateUserControl);
router.put("/:userId/profile", userController.updateProfileControl);
router.put("/:userId/profile/photo", userController.updateProfilePhotoControl);
router.delete("/clientes/:userId", userController.deleteUserControl);

//GESTIÓN ASIGNACIÓN A PLANTILLA
//router.get("/clientes/:userId/:plantillaId", templateController.getUserTemplatesControl);
//router.put("/clientes/:userId/:plantillaId", userController.linkUserToTemplateControl);
//router.delete("/clientes/:userId/:plantillaId", userController.unlinkUserFromTemplateControl);

module.exports = router;