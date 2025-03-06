const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const mongoose = require("mongoose");

const userController = {
  // Render login page
  getLoginPage: (req, res) => {
    res.render("loginPage");
  },

  // Handle user login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set user session
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  generateOtp: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  emailVerification: async (email, otp) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"TextMe Security" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: "Verify Your TextMe Account",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f9fafb;
              }
              .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(114, 105, 239, 0.1);
              }
              .email-header {
                background: linear-gradient(135deg, #7269ef, #9a94ff);
                padding: 30px 20px;
                text-align: center;
                color: white;
                position: relative;
              }
              .logo-container {
                background: white;
                width: 60px;  /* Reduced from 80px */
                height: 60px; /* Reduced from 80px */
                margin: 0 auto 15px;
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .logo {
                width: 100%;
                height: 100%;
                object-fit: contain; /* Ensures the logo fits properly */
                border-radius: 8px;
              }
              .welcome-text {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
                letter-spacing: -0.5px;
              }
              .email-content {
                padding: 40px 32px;
                background: white;
              }
              .otp-card {
                background: linear-gradient(145deg, #ffffff, #f8f9fa);
                border: 1px solid rgba(114, 105, 239, 0.1);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                margin: 24px 0;
                box-shadow: 0 4px 20px rgba(114, 105, 239, 0.08);
              }
              .otp-title {
                color: #7269ef;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
              }
              .otp-digits {
                font-size: 40px;
                font-weight: 700;
                letter-spacing: 12px;
                padding: 20px 30px;
                background: linear-gradient(135deg, #7269ef 0%, #9a94ff 100%);
                color: white;
                border-radius: 12px;
                margin: 20px 0;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(114, 105, 239, 0.2);
              }
              .timer-text {
                color: #dc3545;
                font-size: 14px;
                font-weight: 500;
                margin-top: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              .step-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 32px 0;
                text-align: left;
              }
              .step-item {
                padding: 16px;
                background: #f8f9fa;
                border-radius: 12px;
                border: 1px solid rgba(114, 105, 239, 0.1);
              }
              .step-number {
                color: #7269ef;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
              }
              .step-text {
                color: #495057;
                font-size: 13px;
                line-height: 1.5;
              }
              .features-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin: 32px 0;
              }
              .feature-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
              }
              .feature-icon {
                font-size: 24px;
                margin-bottom: 8px;
              }
              .feature-title {
                color: #495057;
                font-weight: 600;
                font-size: 14px;
                margin: 8px 0;
              }
              .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, rgba(114, 105, 239, 0.1), transparent);
                margin: 32px 0;
              }
              .footer {
                text-align: center;
                padding: 32px;
                background: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .social-links {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin: 20px 0;
              }
              .social-link {
                color: #7269ef;
                text-decoration: none;
              }
              .warning-text {
                color: #6c757d;
                font-size: 13px;
                margin-top: 16px;
                padding: 12px;
                background: #fff8f8;
                border-left: 4px solid #dc3545;
                border-radius: 4px;
              }
              .security-notice {
                margin-top: 32px;
                padding: 16px;
                background: #fff8f8;
                border-left: 4px solid #dc3545;
                border-radius: 4px;
                font-size: 13px;
                color: #dc3545;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <div class="logo-container">
                  <img src="cid:logo" class="logo" alt="TextMe Logo">
                </div>
                <h1 class="welcome-text">Verify Your Account</h1>
                <p style="margin: 8px 0 0">Welcome to TextMe! Let's get you started</p>
              </div>
              
              <div class="email-content">
                <p style="font-size: 16px; color: #495057; margin-bottom: 24px;">
                  Hi there! 👋<br>
                  Thank you for choosing TextMe. To ensure your security, please verify your account using the verification code below.
                </p>

                <div class="otp-card">
                  <div class="otp-title">Your Verification Code</div>
                  <div class="otp-digits">${otp}</div>
                  <div class="timer-text">
                    ⏰ This code will expire in 2 minutes
                  </div>
                </div>

                <div class="step-grid">
                  <div class="step-item">
                    <div class="step-number">Step 1</div>
                    <div class="step-text">Copy the verification code shown above</div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">Step 2</div>
                    <div class="step-text">Enter the code in the verification window</div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">Step 3</div>
                    <div class="step-text">Start enjoying TextMe's features</div>
                  </div>
                </div>

                <div class="features-grid">
                  <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">Instant Messaging</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Secure Chats</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🌐</div>
                    <div class="feature-title">Cross-Platform</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Mobile Friendly</div>
                  </div>
                </div>

                <div class="security-notice">
                  <strong>Security Notice:</strong><br>
                  • Never share this code with anyone<br>
                  • TextMe will never ask for this code via email or phone<br>
                  • Code expires in 2 minutes for your security
                </div>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#" class="social-link">Twitter</a>
                  <a href="#" class="social-link">Facebook</a>
                  <a href="#" class="social-link">Instagram</a>
                </div>
                <p>© ${new Date().getFullYear()} TextMe. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Need help? Contact our support team at <a href="mailto:support@textme.com" style="color: #7269ef;">support@textme.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: "logo.jpg",
            path: "public/assets/logo.jpg",
            cid: "logo",
          },
        ],
      });

      return info.accepted.length > 0;
    } catch (error) {
      console.log("Email was not sent: ", error.message);
      return false;
    }
  },

  // Handle user signup
  signup: async (req, res) => {
    try {
      console.log("Signup request:", req.body);
      const { fullName, email, password, phone, dob } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email: email });
      console.log("Existing user check:", existingUser);

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        dob,
        isVerified: false,
      });

      // Generate OTP
      const otp = userController.generateOtp();

      // Try to send verification email
      const emailSent = await userController.emailVerification(email, otp);
      if (!emailSent) {
        return res
          .status(500)
          .json({ message: "Error sending verification email" });
      }

      // Save user first
      await newUser.save();

      // Store OTP in session if session exists
      if (req.session) {
        req.session.signupOTP = {
          email,
          otp,
          expires: Date.now() + 120000, // 2 minutes expiry
        };
      } else {
        console.warn("Session not available");
      }

      res.status(201).json({
        message: "Account created successfully",
        redirect: "/verify-otp", // Add this redirect URL
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Add a new controller method to render OTP page
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

      // Update user verification status
      const user = await User.findOneAndUpdate(
        { email: req.session.signupOTP.email },
        { isVerified: true },
        { new: true }
      );

      // Set user session after verification
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      // Clear OTP from session
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
      const emailSent = await userController.emailVerification(
        req.session.signupOTP.email,
        newOtp
      );

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

  // Handle user logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.redirect("/login");
    });
  },

  // Render forgot password page
  getForgotPasswordPage: (req, res) => {
    res.render("forgotPassword");
  },

  // Handle forgot password request
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Implement password reset logic
      // This would typically involve:
      // 1. Generating a reset token
      // 2. Sending an email with reset instructions
      // 3. Creating a reset password endpoint

      res
        .status(200)
        .json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Add this new method
  getDashboard: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    res.render("dashboard", { user: req.session.user });
  },
};

module.exports = userController;
