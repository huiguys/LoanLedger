const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { generateTokens, verifyRefreshToken, getTokenExpiry, JWT_REFRESH_EXPIRES_IN } = require('../config/jwt');
const { generateOTP, getOTPExpiry, sendOTP } = require('../utils/otp');
const { 
  validateMobileNumber, 
  validatePassword, 
  validateOTP, 
  handleValidationErrors,
  sanitizeMobileNumber 
} = require('../utils/validation');
const { authenticateToken } = require('../middleware/auth');
const { otpLimiter, loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// User Registration
router.post('/register', 
  registerLimiter,
  validateMobileNumber(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      const sanitizedMobile = sanitizeMobileNumber(mobileNumber);

      // Check if user already exists
      const existingUser = await database.get(
        'SELECT id, is_verified FROM users WHERE mobile_number = ?',
        [sanitizedMobile]
      );

      if (existingUser) {
        if (existingUser.is_verified) {
          return res.status(409).json({
            success: false,
            message: 'User already registered and verified'
          });
        } else {
          // User exists but not verified, allow re-registration
          await database.run('DELETE FROM users WHERE mobile_number = ?', [sanitizedMobile]);
        }
      }

      // Create new user
      const result = await database.run(
        'INSERT INTO users (mobile_number) VALUES (?)',
        [sanitizedMobile]
      );

      // Generate and send OTP
      const otp = generateOTP();
      const expiryTime = getOTPExpiry(5); // 5 minutes

      await database.run(
        'INSERT INTO otps (mobile_number, otp, expiry_time) VALUES (?, ?, ?)',
        [sanitizedMobile, otp, expiryTime.toISOString()]
      );

      // Send OTP via SMS
      const smsResult = await sendOTP(sanitizedMobile, otp);

      if (!smsResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Registration initiated. Please verify OTP sent to your mobile number.',
        data: {
          userId: result.id,
          mobileNumber: sanitizedMobile,
          otpExpiry: expiryTime.toISOString()
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Send OTP
router.post('/send-otp',
  otpLimiter,
  validateMobileNumber(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      const sanitizedMobile = sanitizeMobileNumber(mobileNumber);

      // Check if user exists
      const user = await database.get(
        'SELECT id FROM users WHERE mobile_number = ?',
        [sanitizedMobile]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }

      // Invalidate previous OTPs
      await database.run(
        'UPDATE otps SET verified = 1 WHERE mobile_number = ? AND verified = 0',
        [sanitizedMobile]
      );

      // Generate new OTP
      const otp = generateOTP();
      const expiryTime = getOTPExpiry(5);

      await database.run(
        'INSERT INTO otps (mobile_number, otp, expiry_time) VALUES (?, ?, ?)',
        [sanitizedMobile, otp, expiryTime.toISOString()]
      );

      // Send OTP
      const smsResult = await sendOTP(sanitizedMobile, otp);

      if (!smsResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          mobileNumber: sanitizedMobile,
          otpExpiry: expiryTime.toISOString()
        }
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Verify OTP
router.post('/verify-otp',
  validateMobileNumber(),
  validateOTP(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { mobileNumber, otp } = req.body;
      const sanitizedMobile = sanitizeMobileNumber(mobileNumber);

      // Find valid OTP
      const otpRecord = await database.get(
        'SELECT * FROM otps WHERE mobile_number = ? AND otp = ? AND verified = 0 AND expiry_time > datetime("now") ORDER BY created_at DESC LIMIT 1',
        [sanitizedMobile, otp]
      );

      if (!otpRecord) {
        // Increment attempts
        await database.run(
          'UPDATE otps SET attempts = attempts + 1 WHERE mobile_number = ? AND verified = 0',
          [sanitizedMobile]
        );

        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Check attempts limit
      if (otpRecord.attempts >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        });
      }

      // Mark OTP as verified
      await database.run(
        'UPDATE otps SET verified = 1 WHERE id = ?',
        [otpRecord.id]
      );

      // Update user verification status
      await database.run(
        'UPDATE users SET is_verified = 1, updated_at = datetime("now") WHERE mobile_number = ?',
        [sanitizedMobile]
      );

      // Get user details
      const user = await database.get(
        'SELECT id, mobile_number FROM users WHERE mobile_number = ?',
        [sanitizedMobile]
      );

      // Generate tokens
      const tokens = generateTokens({ userId: user.id, mobileNumber: user.mobile_number });

      // Store refresh token
      const refreshTokenExpiry = getTokenExpiry(JWT_REFRESH_EXPIRES_IN);
      await database.run(
        'INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES (?, ?, ?)',
        [user.id, tokens.refreshToken, refreshTokenExpiry.toISOString()]
      );

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          user: {
            id: user.id,
            mobileNumber: user.mobile_number,
            isVerified: true
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Login with Password
router.post('/login',
  loginLimiter,
  validateMobileNumber(),
  validatePassword(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { mobileNumber, password } = req.body;
      const sanitizedMobile = sanitizeMobileNumber(mobileNumber);

      // Find user
      const user = await database.get(
        'SELECT id, mobile_number, password_hash, is_verified FROM users WHERE mobile_number = ?',
        [sanitizedMobile]
      );

      if (!user || !user.password_hash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please verify your mobile number first.'
        });
      }

      // Generate tokens
      const tokens = generateTokens({ userId: user.id, mobileNumber: user.mobile_number });

      // Store refresh token
      const refreshTokenExpiry = getTokenExpiry(JWT_REFRESH_EXPIRES_IN);
      await database.run(
        'INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES (?, ?, ?)',
        [user.id, tokens.refreshToken, refreshTokenExpiry.toISOString()]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            mobileNumber: user.mobile_number,
            isVerified: user.is_verified
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Set Password (after OTP verification)
router.post('/set-password',
  authenticateToken,
  validatePassword(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update user password
      await database.run(
        'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
        [passwordHash, userId]
      );

      res.json({
        success: true,
        message: 'Password set successfully'
      });

    } catch (error) {
      console.error('Set password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Reset Password
router.post('/reset-password',
  validateMobileNumber(),
  validateOTP(),
  validatePassword(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { mobileNumber, otp, newPassword } = req.body;
      const sanitizedMobile = sanitizeMobileNumber(mobileNumber);

      // Verify OTP first
      const otpRecord = await database.get(
        'SELECT * FROM otps WHERE mobile_number = ? AND otp = ? AND verified = 0 AND expiry_time > datetime("now") ORDER BY created_at DESC LIMIT 1',
        [sanitizedMobile, otp]
      );

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Mark OTP as verified
      await database.run(
        'UPDATE otps SET verified = 1 WHERE id = ?',
        [otpRecord.id]
      );

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await database.run(
        'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE mobile_number = ?',
        [passwordHash, sanitizedMobile]
      );

      // Invalidate all existing sessions
      await database.run(
        'DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE mobile_number = ?)',
        [sanitizedMobile]
      );

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if session exists and is valid
    const session = await database.get(
      'SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > datetime("now")',
      [refreshToken]
    );

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get user details
    const user = await database.get(
      'SELECT id, mobile_number, is_verified FROM users WHERE id = ?',
      [session.user_id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens({ userId: user.id, mobileNumber: user.mobile_number });

    // Update session with new refresh token
    const newRefreshTokenExpiry = getTokenExpiry(JWT_REFRESH_EXPIRES_IN);
    await database.run(
      'UPDATE sessions SET refresh_token = ?, expires_at = ? WHERE id = ?',
      [tokens.refreshToken, newRefreshTokenExpiry.toISOString(), session.id]
    );

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    if (refreshToken) {
      // Remove specific session
      await database.run(
        'DELETE FROM sessions WHERE user_id = ? AND refresh_token = ?',
        [userId, refreshToken]
      );
    } else {
      // Remove all sessions for user
      await database.run(
        'DELETE FROM sessions WHERE user_id = ?',
        [userId]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT id, mobile_number, is_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          mobileNumber: user.mobile_number,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;