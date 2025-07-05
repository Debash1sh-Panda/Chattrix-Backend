const express = require("express");
const route = express.Router();

route.post('/sign-in', signIn);

module.exports = route;