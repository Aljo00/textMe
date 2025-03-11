const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const guestMiddleware = require("../middleware/guestMiddleware");

// Guest-only routes (accessible only when not logged in)
router.get("/login", guestMiddleware, userController.getLoginPage);
router.post("/login", guestMiddleware, userController.login);
router.post("/signup", guestMiddleware, userController.signup);
router.get("/verify-otp", guestMiddleware, userController.getOtpPage);
router.post("/verify-otp", guestMiddleware, userController.verifyOtp);
router.post("/resend-otp", guestMiddleware, userController.resendOtp);

// Protected routes (accessible only when logged in)
router.get("/dashboard", authMiddleware, userController.getDashboard);
router.get("/logout", authMiddleware, userController.logout);

// Protected API routes
router.get("/api/friends", authMiddleware, userController.getFriends);
router.get(
  "/api/friend-requests",
  authMiddleware,
  userController.getFriendRequests
);
router.get("/api/search-users", authMiddleware, userController.searchUsers);
router.get("/api/call-history", authMiddleware, userController.getCallHistory);
router.post(
  "/api/send-friend-request",
  authMiddleware,
  userController.sendFriendRequest
);
router.post(
  "/api/handle-friend-request",
  authMiddleware,
  userController.handleFriendRequest
);

// Add new route for user details
router.get("/api/user/:userId", authMiddleware, userController.getUserDetails);

// Add new route for sent requests
router.get(
  "/api/sent-requests",
  authMiddleware,
  userController.getSentRequests
);

module.exports = router;
