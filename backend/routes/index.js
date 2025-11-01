const express = require("express");
const router = express.Router();

const loginRoute = require("./auth");
const userRoute = require("./user");

router.use("/auth", loginRoute);
router.use("", userRoute);


module.exports = router;


