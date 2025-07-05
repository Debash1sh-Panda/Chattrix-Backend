const mongoose = require("mongoose");

const resetPasswordTokenDataSchema = new mongoose.Schema(
  {
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpire: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: String,
    phone: String,
    country_code: String,
    password: String,
    profile_image: String,
    firstname: String,
    lastname: {
      type: String,
      default: "",
    },
    bio: String,
    pronouns: String,
    location: String,
    social_accounts: String,
    isActive: Boolean,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: String,
    reetPasswordTokenData: {
      type: resetPasswordTokenDataSchema,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema, "users");
