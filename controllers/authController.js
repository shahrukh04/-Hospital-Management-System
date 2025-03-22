import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "patient", username, phone } = req.body;

    // Predefined admin email
    const ADMIN_EMAIL = "shahrukh@gmail.com";

    // Check if the user is trying to register as admin
    if (role === "admin" && email !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create an admin account.",
      });
    }

    // Allow the predefined admin email to bypass the role check
    if (role !== "patient" && email !== ADMIN_EMAIL && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can register users with this role.",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email ? "Email already exists" : "Username already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      username: username || name.toLowerCase().replace(/\s+/g, "."),
      phone,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
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
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
      error: error.message,
    });
  }
};

// Middleware to check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Insufficient permissions.",
      });
    }

    next();
  };
};

// Get current user details
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
      error: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change password.",
      error: error.message,
    });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");
    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch preferences.",
      error: error.message,
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true }
    ).select("preferences");

    res.json({
      success: true,
      message: "Preferences updated successfully.",
      preferences: updatedUser.preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update preferences.",
      error: error.message,
    });
  }
};

// Get user permissions
export const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("permissions");
    res.json({
      success: true,
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions.",
      error: error.message,
    });
  }
};

// Get all user roles
export const getAllUserRoles = async (req, res) => {
  try {
    const roles = ["admin", "doctor", "patient", "reception", "nurse", "lab_technician", "pharmacist"];
    res.json({
      success: true,
      roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
      error: error.message,
    });
  }
};

// Get users with a specific role
export const getUsersWithRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const users = await User.find({ role: roleId }).select("-password");
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users with role.",
      error: error.message,
    });
  }
};

// Assign a role to a user
export const assignUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: roleId },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Role assigned successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign role.",
      error: error.message,
    });
  }
};