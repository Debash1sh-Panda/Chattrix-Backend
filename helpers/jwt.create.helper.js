const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
  try {
    return jwt.sign(
      {
        id: payload._id,
        role: payload.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token.");
  }
};

exports.generateRefreshToken = (payload) => {
  // console.log("Payload.email in generateRefreshToken", payload.email);
  try {
    return jwt.sign(
      {
        id: payload._id,
        email: payload.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Failed to generate refresh token.");
  }
};
