const express = require('express');
const router = express.Router({ "mergeParams": true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');

const UserController = require("../controllers/users.js");

router.get("/signup", UserController.renderSignupForm);

router.post("/signup", wrapAsync(UserController.Signup));

router.get("/login", UserController.renderLoginForm);

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), wrapAsync(UserController.Login));

router.get("/logout", UserController.Logout);
module.exports = router;