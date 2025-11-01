const express = require("express");
const router = express.Router();

const exerciseRoute = require("./exercise");

router.use("/exercises", exerciseRoute);

module.exports = router;