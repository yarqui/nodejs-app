const express = require("express");
const { validateBody } = require("../../middlewares");
const { schemas } = require("../../models/user");
const ctrl = require("../../controllers/auth");
const router = express.Router();

module.exports = router;

router.post("/signup", validateBody(schemas.signupSchema), ctrl.signup);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
