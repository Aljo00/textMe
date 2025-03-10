const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const mongoose = require("mongoose");
const sendmail = require("../helpers/sendEmail");
const { generateTokens } = require("../config/JWT");
const socketService = require("../services/socketService");

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

      // Update online status
      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
      });
      socketService.getIO().emit("user_status_change", {
        userId: user._id,
        isOnline: true,
      });

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

  logout: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socketService.getIO().emit("user_status_change", {
        userId: req.user.id,
        isOnline: false,
        lastSeen: new Date(),
      });

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
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getDashboard: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.redirect("/login");
      }

      console.log("User:", user);
      res.render("dashboard", { user });
    } catch (error) {
      console.error(error);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.redirect("/login");
    }
  },

  getFriends: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate(
        "friends",
        "name profilePic isOnline lastSeen"
      );
      res.json({ friends: user.friends });
    } catch (error) {
      res.status(500).json({ message: "Error fetching friends" });
    }
  },

  getFriendRequests: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate(
        "pendingRequests",
        "name profilePic"
      );
      const count = user.pendingRequests.length;
      res.json({ requests: user.pendingRequests, count });
    } catch (error) {
      res.status(500).json({ message: "Error fetching friend requests" });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const query = req.query.q;
      const currentUser = await User.findById(req.user.id);

      const excludeIds = [
        currentUser._id,
        ...(currentUser.friends || []),
        ...(currentUser.pendingRequests || []),
      ];

      let searchQuery = {
        _id: { $nin: excludeIds },
      };

      if (query && query.trim().length > 0) {
        searchQuery.name = { $regex: query, $options: "i" };
      }

      const users = await User.find(searchQuery)
        .select("name email profilePic isOnline lastSeen") // Added lastSeen
        .limit(20);

      res.json({ users });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        message: "Error searching users",
        error: error.message,
      });
    }
  },

  sendFriendRequest: async (req, res) => {
    try {
      const { userId } = req.body;
      const fromUser = await User.findById(req.user.id);
      const targetUser = await User.findById(userId);

      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (targetUser.pendingRequests.includes(req.user.id)) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      // Add to pending requests
      targetUser.pendingRequests.push(req.user.id);
      await targetUser.save();

      // Only emit to the target user's socket
      socketService
        .getIO()
        .to(`user_${userId}`)
        .emit("new_friend_request", {
          toUserId: userId,
          fromUser: {
            id: fromUser._id,
            name: fromUser.name,
            profilePic: fromUser.profilePic,
          },
          count: targetUser.pendingRequests.length,
        });

      res.json({ success: true, message: "Friend request sent successfully" });
    } catch (error) {
      console.error("Send friend request error:", error);
      res.status(500).json({ message: "Error sending friend request" });
    }
  },

  handleFriendRequest: async (req, res) => {
    try {
      const { requestId, action } = req.body;
      const currentUser = await User.findById(req.user.id);

      if (!currentUser.pendingRequests.includes(requestId)) {
        return res.status(400).json({ message: "No such friend request" });
      }

      // Remove from pending requests
      currentUser.pendingRequests = currentUser.pendingRequests.filter(
        (id) => id.toString() !== requestId
      );

      if (action === "accept") {
        // Add to friends list for both users
        currentUser.friends.push(requestId);
        const otherUser = await User.findById(requestId);
        otherUser.friends.push(currentUser._id);
        await otherUser.save();
      }

      await currentUser.save();

      // Emit socket event for request count update
      socketService.getIO().emit("update_request_count", {
        userId: currentUser._id,
        count: currentUser.pendingRequests.length,
      });

      res.json({ success: true, message: `Friend request ${action}ed` });
    } catch (error) {
      console.error("Handle friend request error:", error);
      res.status(500).json({ message: "Error handling friend request" });
    }
  },

  getCallHistory: async (req, res) => {
    // Demo data for call history
    const demoHistory = [
      {
        id: 1,
        name: "John Doe",
        type: "outgoing",
        duration: "5:23",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 2,
        name: "Jane Smith",
        type: "incoming",
        duration: "2:45",
        timestamp: new Date(Date.now() - 7200000),
      },
    ];
    res.json({ history: demoHistory });
  },

  // Add new controller method for getting user details
  getUserDetails: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).select(
        "name email phone profilePic isOnline lastSeen createdAt"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  },
};

module.exports = userController;
