const express = require("express");
const { getUserDetails } = require("../controllers/user.controller");
const route = express.Router();

route.get("/details", getUserDetails);

module.exports = route;
