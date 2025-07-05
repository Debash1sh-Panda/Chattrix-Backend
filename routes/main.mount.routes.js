const authRoute = require("../routes/auth.routes.js");

const setupRoutes = (baseUrl, chattrix) => {

  chattrix.use(`${baseUrl}/auth`, authRoute);

};

module.exports = setupRoutes;
