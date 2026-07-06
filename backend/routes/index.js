const express = require("express");
const router = express.Router();

// ==========================================================
// IMPORTACIÓN DE MÓDULOS DE RUTAS (SUB-ROUTERS)
// ==========================================================
// Cada constante representa un dominio funcional independiente de la aplicación.

const loginRoute = require("./auth");                   // Autenticación y recuperación de contraseña
const userRoute = require("./user");                    // Gestión de usuarios (perfil, alta, baja, vínculos con plantillas)
const categoryRoute = require("./category");            // CRUD de categorías y vinculación con ejercicios
const exerciseRoute = require("./exercise");            // CRUD de ejercicios y vinculación con vídeos
const materialRoute = require("./material");            // Gestión de material
const templateRoute = require("./template");            // Plantillas de rutinas predefinidas
const rutinaAdminRoute = require("./rutinaAdmin");      // Gestión de rutinas asigandas a clientes (Rol Admin/Entrenador)
const rutinaClienteRoute = require("./rutinaCliente")   // Gestión de rutinas personales (Rol Cliente)
const videoRoute = require("./video");                  // Gestión de videos asociados

/**
 * @module routes/index
 * @description Punto de entrada principal para el enrutamiento de la API.
 * Centraliza y delega las peticiones a los sub-módulos según el prefijo de la URL.
 */

/**
 * Montaje de sub-rutas (Middleware de Enrutamiento).
 * Express delega el tráfico entrante basándose en el prefijo de la URL.
 */

// /api/auth/* -> Delega a auth.js
router.use("/auth", loginRoute);

// /api/* (Raíz) -> Delega a user.js
// Al estar vacío (""), las rutas definidas en userRoute (ej. "/profile") se montan directamente en la raíz.
router.use("", userRoute);

// /api/categorias/* -> Delega a category.js
router.use("/categorias", categoryRoute);

// /api/ejercicios/* -> Delega a exercise.js
router.use("/ejercicios", exerciseRoute);

// /api/materiales/* -> Delega a material.js
router.use("/materiales", materialRoute);

// /api/plantillas/* -> Delega a template.js
router.use("/plantillas", templateRoute);

// /api/rutinas/* -> Delega a rutinaAdmin.js (Gestión global de rutinas asignadas a clientes)
router.use("/rutinas", rutinaAdminRoute);

// /api/mis-rutinas/* -> Delega a rutinaCliente.js (Rutinas asignadas al usuario logueado)
// Separación clara de responsabilidades: Admin crea rutinas globales, Cliente gestiona las suyas.
router.use("/mis-rutinas", rutinaClienteRoute);

// /api/videos/* -> Delega a video.js
router.use("/videos", videoRoute);

// Exportación del router consolidado para ser usado en app.js
module.exports = router;


