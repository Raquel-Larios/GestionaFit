const express = require("express");
const router = express.Router();

const materialRoute = require("./material");

router.use("/materials", materialRoute);

module.exports = router;