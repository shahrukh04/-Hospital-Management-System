const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
    const {   username, email, password } = req.body;
    
    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 
                    "Email already exists" : 
                    "Username already exists"
            });
        }

        // Create new user (password will be hashed by the pre-save middleware)
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message // Add this for debugging
        });
    }
});

// Rest of your login route remains the same...
router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
          return res.status(400).json({
              success: false,
              message: "Email and password are required"
          });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({
              success: false,
              message: "Invalid email"
          });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({
              success: false,
              message: "Invalid passwords"
          });
      }

      // Generate JWT token
      const token = jwt.sign(
          { 
              userId: user._id,
              email: user.email 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
      );

      // Send success response
      res.json({
          success: true,
          token,
          user: {
              id: user._id,
              username: user.username,
              email: user.email
          }
      });

  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
          success: false,
          message: "Login failed",
          error: error.message // Adding error message for debugging
      });
  }
});
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "No token provided"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        try {
            const user = await User.findById(decoded.userId).select("-password"); // Exclude password
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message
            });
        }
    });
};
// Get logged-in user details (Protected Route)
router.get("/me", verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});
module.exports = router;