const { verifyAccessToken } = require('../config/jwt');
// CORRECTED: Import the database client correctly
const { dbClient: db } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Verify user still exists
    // CORRECTED: Use the correct database client variable 'db'
    const result = await db.query(
      'SELECT id, mobile_number FROM users WHERE id = $1',
      // CORRECTED: The token payload has 'id', not 'userId'
      [decoded.id] 
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      mobileNumber: user.mobile_number,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken
};
