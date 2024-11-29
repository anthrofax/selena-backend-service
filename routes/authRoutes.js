const express = require("express");
const { signupHandler, verifyOtpHandler } = require("../handlers/signup");
const loginHandler = require("../handlers/login");

const authRoutes = express.Router();

authRoutes.post("/signup", signupHandler);
authRoutes.post("/otp/verify", verifyOtpHandler);

authRoutes.post("/login", loginHandler);

module.exports = authRoutes;
