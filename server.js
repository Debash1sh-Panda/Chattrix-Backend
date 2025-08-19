require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dbConnection = require("./config/database.config");
const setupRoutes = require("./routes/main.mount.routes");
const chattrix = express();
const baseUrl = process.env.BASE_URI

// cors policy
const allowedOrigins = [
  `${process.env.FRONTEND_ORIGIN_URL}`
];

chattrix.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const message =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(message), false);
    },
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// middleware libraries
chattrix.use(cookieParser());

if (process.env.NODE_ENV === "dev") {
  chattrix.use(morgan("dev"));
}

chattrix.use(helmet());

chattrix.use(express.json());

chattrix.use(bodyParser.urlencoded({ extended: true }));

setupRoutes(`${process.env.BASE_URI}`, chattrix);

dbConnection();

chattrix.listen(process.env.PORT || 2020, () =>
  console.log(`Yahh 🤠, Server is runnig on PORT: ${process.env.PORT || 2020}`)
);

chattrix.get(`${baseUrl}`, (req, res) => res.send("Hay 👋🏻, I am Chattrix Server!"));
