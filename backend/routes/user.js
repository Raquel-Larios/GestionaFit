const express = require("express");
const router = express.Router();
const db = require("../database/db");
const userController = require("../controllers/userController");
const templateController = require("../controllers/templateController");


router.get("/clientes_apellidos", (req, res) => {
    db.query('SELECT id, nombre, apellidos, email, foto_perfil FROM usuario WHERE rol = 0 ORDER BY apellidos ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/clientes_nombre", (req, res) => {
    db.query('SELECT id, nombre, apellidos, email, foto_perfil FROM usuario WHERE rol = 0 ORDER BY nombre ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//Cliente por id
router.get("/clientes/:id_usuario", (req, res) =>{
    db.query('SELECT id, email, nombre, apellidos FROM usuario WHERE id = ? AND rol = 0', [req.params.id_usuario], (err, results) => {
        if(err) throw err;
        res.json(results);
    })
})

//Generico para el perfil completo por id
router.get("/:id_usuario/profile", (req, res) =>{
    db.query('SELECT id, email, nombre, apellidos, isPassGenerated, foto_perfil, peso FROM usuario WHERE id = ?', [req.params.id_usuario], (err, results) => {
        if(err) throw err;
        res.json(results);
    })
})

router.post("/clientes", userController.createUserControl);
router.put("/clientes/:id_usuario", userController.updateUserControl);
router.put("/:id_usuario/profile", userController.updateProfileControl);
router.put("/:id_usuario/profile/photo", userController.updateProfilePhotoControl);
router.delete("/clientes/:id_usuario", userController.deleteUserControl);

//GESTIÓN ASIGNACIÓN A PLANTILLA
//router.get("/clientes/:id_usuario/:id_plantilla", templateController.getUserTemplatesControl);
//router.put("/clientes/:id_usuario/:id_plantilla", userController.linkUserToTemplateControl);
//router.delete("/clientes/:id_usuario/:id_plantilla", userController.unlinkUserFromTemplateControl);

module.exports = router;