const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Authentication routes
router.get('/login', userController.getLoginPage);
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/logout', userController.logout);
router.get('/forgot-password', userController.getForgotPasswordPage);
router.post('/forgot-password', userController.forgotPassword);

module.exports = router;