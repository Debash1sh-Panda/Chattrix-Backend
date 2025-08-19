const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../helpers/jwt.create.helper");
const logActivity = require("../helpers/activities.helper");

exports.requestOtpForEmailVerification = async (req, res) => {
  console.log(
    "email from requestOtpForEmailVerification",
    req.body.email,
    // req.body.phone
  );
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "Account already exists. Please login!",
      });
    }
    // if (user.phone.toString() === phone) {
    //   return res
    //     .status(409)
    //     .json({ success: false, message: "Phone number already Registered!" });
    // }

    // Generate a 6-digit OTP
    const generateOtp = (length) => {
      let otp = "";
      for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
      }
      return otp;
    };

    const otp = generateOtp(6);

    // Set OTP expiration time
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Check if OTP already exists for the given email
    let otpData = await tempOtpModel.findOne({ email });

    // If OTP exists, update it
    if (otpData) {
      otpData.otp = otp;
      otpData.otpExpires = otpExpires; 
    } else {
      // Create a new OTP record if it doesn't exist
      otpData = new tempOtpModel({
        email,
        otp,
        otpExpires: otpExpires,
      });
    }
    
    await otpData.save();
    
    // FIXME: Send OTP to email
    await sendEmailOtpForSignup(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your Email.",
      otp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

exports.verifyOtpForEmailVerification = async (req, res) => {
  console.log(
    "email and otp from verifyOtpForEmailVerification",
    req.body.email,
    req.body.otp
  );
  const { email, otp } = req.body;

  // Check for empty values in the request bodys
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const otpData = await tempOtpModel.findOne({ email });

    if (!otpData) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email." });
    }

    // Normalize and compare OTP values
    if (String(otpData.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpData.otpExpires)) {
      await tempOtpModel.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired, request a new one.",
      });
    }

    // Send response with tokens
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    // const { data } = req.body;
    // const decryptedBytes = CryptoJS.AES.decrypt(
    //   data,
    //   process.env.DECRYPT_SECRET_KEY
    // );
    // const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // if (!decryptedText) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid or tampered encrypted data.",
    //   });
    // }

    // const decryptedPayload = JSON.parse(decryptedText);

    const { fullname, email, phone, password } = req.body;

    // console.log("decryptedPayload", decryptedPayload)
    if (!(fullname && email && phone && password)) {
      return res.status(400).json({
        success: false,
        message: "All mandatory fields are required, except lastname",
      });
    }

    const emailExists = await userModel.findOne({ email: email });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered, Please login!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      fullname: fullname?.trim(),
      email: email?.trim(),
      phone: phone,
      password: hashedPassword,
      isActive: true,
    });

    await newUser.save();

    // Generate access and refresh token
    const accessToken = generateAccessToken(newUser);

    await logActivity(
      newUser._id,
      `A new user (${newUser.fullname}) registered successfully.`
    );

    //sending email to user after registration
    // await registration(newUser.email);

    // Send response with tokens
    return res.status(200).json({
      success: true,
      message: "Hay! Welcome to Chattrix 🎉",
      user: {
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        country_code: newUser.country_code,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      accessToken,
    });
  } catch (error) {
    console.error("error during user registration", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { data } = req.body;

    const decryptedBytes = CryptoJS.AES.decrypt(
      data,
      process.env.DECRYPT_SECRET_KEY
    );
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      return res.status(400).json({
        success: false,
        message: "Invalid or tampered encrypted data.",
      });
    }

    const decryptedPayload = JSON.parse(decryptedText);

    const { email, password } = decryptedPayload;

    // All fields are required
    if (!(email && password)) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Check for spaces in email and password
    if (email.trim().includes(" ") || password.trim().includes(" ")) {
      return res.status(400).json({
        success: false,
        message: "Spaces are not allowed in email or password.",
      });
    }

    // Check existing user data or not
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No register user found, Please create an account.",
      });
    }

    // Check password is matching or not
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password! Please try again.",
      });
    }

    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    // Store refresh token in the database
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    res
      .status(200)
      .cookie("rt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Welcome back to Chattrix Platform 👋",
        user: {
          email: existingUser.email,
          role: existingUser.role,
        },
        accessToken,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error! Please try again later.",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { refreshToken: null, isActive: false });
    }

    res
      .status(200)
      .clearCookie("rt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      })
      .json({
        success: true,
        message: "You Successfully logged out",
      });
  } catch (error) {
    console.log(error);
    console.error("Error during user logout:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};