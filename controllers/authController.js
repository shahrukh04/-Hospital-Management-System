import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "patient", username } = req.body;

    // Predefined admin email
    const ADMIN_EMAIL = "shahrukh@gmail.com";

    // Check if the user is trying to register as admin
    if (role === "admin" && email !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "You are not allow for admin account."
      });
    }

    // Allow the predefined admin email to bypass the role check
    if (role !== "patient" && email !== ADMIN_EMAIL && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can register users with this role."
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email ? "Email already exists" : "Username already exists"
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      username: username || name.toLowerCase().replace(/\s+/g, '.')
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// Middleware to verify token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message
    });
  }
};

// Middleware to check user roles
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

// Get current user details
export const getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};