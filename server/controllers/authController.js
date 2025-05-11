const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register controller
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Registration attempt for:', { username, email }); // Log attempt

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('Registration failed: Email already exists'); // Log duplicate email
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    console.log('User registered successfully:', { userId: result.insertId }); // Log success

    // Create token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Server registration error:', error); // Detailed error logging
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google Sign-In controller
const googleSignIn = async (req, res) => {
  try {
    const { email, googleId, name } = req.body;
    console.log('Google Sign-In attempt for:', { email, googleId, name });

    // Check if user exists with this email
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ? OR google_id = ?',
      [email, googleId]
    );

    let user;
    if (existingUsers.length > 0) {
      // User exists, update Google ID if needed
      user = existingUsers[0];
      if (!user.google_id) {
        await db.query(
          'UPDATE users SET google_id = ? WHERE id = ?',
          [googleId, user.id]
        );
        user.google_id = googleId;
      }
    } else {
      // Create new user
      const [result] = await db.query(
        'INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)',
        [name, email, googleId]
      );
      user = {
        id: result.insertId,
        username: name,
        email,
        google_id: googleId
      };
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Google Sign-In successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  googleSignIn
}; 