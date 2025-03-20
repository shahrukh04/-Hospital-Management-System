import jwt from 'jsonwebtoken';

/**
 * Middleware to verify authentication token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireAuth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied, no token provided"
    });
  }

  try {
    // Remove 'Bearer ' if present
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

/**
 * Middleware to check if user has admin role
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, admin privileges required"
    });
  }
};

/**
 * Middleware to check if user is staff (doctor, nurse, receptionist)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireStaff = (req, res, next) => {
  const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist'];
  if (req.user && staffRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, staff privileges required"
    });
  }
};