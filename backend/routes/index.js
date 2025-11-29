const express = require("express");
const router = express.Router();

const loginRoute = require("./auth");
const userRoute = require("./user");
const categoryRoute = require("./category");
const exerciseRoute = require("./exercise");
const materialRoute = require("./material");
const templateRoute = require("./template");
const videoRoute = require("./video");

router.use("/auth", loginRoute);
router.use("/clientes", userRoute);
router.use("/categorias", categoryRoute);
router.use("/ejercicios", exerciseRoute);
router.use("/materiales", materialRoute);
router.use("/plantillas", templateRoute);
router.use("/rutinas", templateRoute);
router.use("/:userId/mis-rutinas", templateRoute);
router.use("/demostraciones", videoRoute);
router.use("/perfil", userRoute);


module.exports = router;


