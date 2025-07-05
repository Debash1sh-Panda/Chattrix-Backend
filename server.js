require("dotenv").config();
const express = require("express");
const dbConnection = require("./config/database.config");
const chattrix = express();


dbConnection();
chattrix.listen(process.env.PORT || 2020, () =>
  console.log(`Yahh 🤠, Server is runnig on PORT: ${process.env.PORT || 2020}`)
);


chattrix.get("/", (req, res) => res.send("Hay 👋🏻, I am Chattrix Server!"));