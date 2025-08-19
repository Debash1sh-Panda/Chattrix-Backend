const express = require("express");
const { signUp, signIn } = require("../controllers/auth.controllers");
const route = express.Router();

route.post("/sign-up", signUp);
route.post("/sign-in", signIn);

module.exports = route;
