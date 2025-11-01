const express = require("express");
const router = express.Router();

const templateRoute = require("./template");

router.use("/templates", templateRoute);

module.exports = router;