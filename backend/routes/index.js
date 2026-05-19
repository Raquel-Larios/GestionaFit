const express = require("express");
const router = express.Router();

const loginRoute = require("./auth");
const userRoute = require("./user");
const categoryRoute = require("./category");
const exerciseRoute = require("./exercise");
const materialRoute = require("./material");
const templateRoute = require("./template");
const rutinaAdminRoute = require("./rutinaAdmin");
const rutinaClienteRoute = require("./rutinaCliente")
const videoRoute = require("./video");

router.use("/auth", loginRoute);
router.use("", userRoute);
router.use("/categorias", categoryRoute);
router.use("/ejercicios", exerciseRoute);
router.use("/materiales", materialRoute);
router.use("/plantillas", templateRoute);
router.use("/rutinas", rutinaAdminRoute);
router.use("/mis-rutinas", rutinaClienteRoute);
router.use("/videos", videoRoute);


module.exports = router;


