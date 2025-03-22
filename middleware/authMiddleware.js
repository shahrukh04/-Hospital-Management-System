import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify authentication token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireAuth = async (req, res, next) => {
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

    // Fetch the user from database to get the most up-to-date user data
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive"
      });
    }

    // Set the user in the request
    req.user = user;
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
  const staffRoles = ['admin', 'doctor', 'nurse', 'reception', 'lab_technician', 'pharmacist'];
  if (req.user && staffRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, staff privileges required"
    });
  }
};

/**
 * Generic role authorization middleware
 * @param {...string} roles - Roles that are authorized to access the route
 * @returns {function} Middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Insufficient permissions"
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a doctor
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireDoctor = (req, res, next) => {
  if (req.user && ['doctor', 'admin'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, doctor privileges required"
    });
  }
};

/**
 * Middleware to check if user is a patient
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requirePatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied, patient access only"
    });
  }
};

/**
 * Middleware to check if user is either the patient or a medical staff
 * Useful for accessing patient records
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requirePatientOrMedical = (req, res, next) => {
  const medicalRoles = ['admin', 'doctor', 'nurse'];

  // Check if user is medical staff
  if (req.user && medicalRoles.includes(req.user.role)) {
    next();
    return;
  }

  // If not medical staff, check if user is the patient whose data is being accessed
  const patientId = req.params.patientId || req.body.patientId;
  if (req.user && req.user.role === 'patient' && req.user._id.toString() === patientId) {
    next();
    return;
  }

  return res.status(403).json({
    success: false,
    message: "Access denied, insufficient permissions"
  });
};