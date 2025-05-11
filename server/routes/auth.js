const express = require('express');
const router = express.Router();
const { register, login, googleSignIn } = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Google Sign-In route
router.post('/google', googleSignIn);

module.exports = router; 