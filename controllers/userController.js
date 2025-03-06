const bcrypt = require('bcrypt');
const User = require('../models/userSchema');

const userController = {
    // Render login page
    getLoginPage: (req, res) => {
        res.render('loginPage');
    },

    // Handle user login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Set user session
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email
            };

            res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Handle user signup
    signup: async (req, res) => {
        try {
            console.log('Signup request:', req.body);
            const{ name, email, password, phone, dob } = req.body;
            res.status(201).json({ message: 'Signup successful' });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Handle user logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.redirect('/login');
        });
    },

    // Render forgot password page
    getForgotPasswordPage: (req, res) => {
        res.render('forgotPassword');
    },

    // Handle forgot password request
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            
            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // TODO: Implement password reset logic
            // This would typically involve:
            // 1. Generating a reset token
            // 2. Sending an email with reset instructions
            // 3. Creating a reset password endpoint

            res.status(200).json({ message: 'Password reset instructions sent to your email' });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = userController;