const authRoute = require("../routes/auth.routes.js");
const userRoute = require("../routes/user.routes.js");

const setupRoutes = (baseUrl, chattrix) => {
  chattrix.use(`${baseUrl}/auth`, authRoute);
  chattrix.use(`${baseUrl}/user`, userRoute);
};

module.exports = setupRoutes;
