const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Authentication routes
router.get("/login", userController.getLoginPage);
router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.get("/logout", userController.logout);;
router.get("/verify-otp", userController.getOtpPage); // Add this new route
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/dashboard", userController.getDashboard);

module.exports = router;
