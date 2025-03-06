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

module.exports = router;
