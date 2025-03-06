const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const mongoose = require("mongoose");
const sendmail = require("../helpers/sendEmail");
const { generateTokens } = require("../config/JWT");

const userController = {
  // Render login page
  getLoginPage: (req, res) => {
    res.render("loginPage");
  },

  // Handle user login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // Set access token in cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      });

      // Set refresh token in cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        redirect: "/dashboard",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { accessToken } = generateTokens(user);
      res.json({ accessToken });
    } catch (error) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  },

  generateOtp: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Handle user signup
  signup: async (req, res) => {
    try {
      console.log("Signup request:", req.body);
      const { fullName, email, password, phone, dob } = req.body;

      const existingUser = await User.findOne({ email: email });
      console.log("Existing user check:", existingUser);

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        dob,
        isVerified: false,
      });

      const otp = userController.generateOtp();

      const emailSent = await sendmail(email, otp);
      if (!emailSent) {
        return res
          .status(500)
          .json({ message: "Error sending verification email" });
      }

      await newUser.save();

      if (req.session) {
        req.session.signupOTP = {
          email,
          otp,
          expires: Date.now() + 120000,
        };
      } else {
        console.warn("Session not available");
      }

      res.status(201).json({
        message: "Account created successfully",
        redirect: "/verify-otp",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getOtpPage: (req, res) => {
    res.render("otpVerification");
  },

  verifyOtp: async (req, res) => {
    try {
      const { otp } = req.body;

      if (!req.session.signupOTP) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (Date.now() > req.session.signupOTP.expires) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (otp !== req.session.signupOTP.otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const user = await User.findOneAndUpdate(
        { email: req.session.signupOTP.email },
        { isVerified: true },
        { new: true }
      );

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      delete req.session.signupOTP;

      res.status(200).json({
        message: "Account verified successfully",
        redirect: "/dashboard",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  resendOtp: async (req, res) => {
    try {
      if (!req.session.signupOTP?.email) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const newOtp = userController.generateOtp();
      const emailSent = await sendmail(req.session.signupOTP.email, newOtp);

      if (!emailSent) {
        return res.status(500).json({ message: "Error sending OTP" });
      }

      req.session.signupOTP = {
        email: req.session.signupOTP.email,
        otp: newOtp,
        expires: Date.now() + 120000,
      };

      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  logout: (req, res) => {
    // Clear JWT cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Clear session if exists
    if (req.session) {
      req.session.destroy();
    }

    // Send success message with redirect
    req.session = null; // Ensure session is cleared
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      redirect: "/login",
    });
  },

  getDashboard: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.redirect("/login");
      }
      res.render("dashboard", { user });
    } catch (error) {
      console.error(error);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.redirect("/login");
    }
  },
};

module.exports = userController;
