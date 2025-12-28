const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mongoose = require('mongoose');
const { redirectIfAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Middleware to check database connection
const checkDB = (req, res, next) => {
    if (!mongoose.connection.readyState) {
        return res.status(503).json({
            success: false,
            error: 'Database connection unavailable. Please check your MongoDB connection.'
        });
    }
    next();
};

// Signup route
router.post('/signup', checkDB, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], authController.signup);

// Signin route
router.post('/signin', checkDB, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], authController.signin);

// Logout route
router.post('/logout', authController.logout);

// Get current user route
router.get('/me', authController.getCurrentUser);

// Signup page
router.get('/signup', redirectIfAuthenticated, authController.renderSignup);

// Signin page
router.get('/signin', redirectIfAuthenticated, authController.renderSignin);

module.exports = router;
