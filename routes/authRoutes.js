import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  authorize,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  getUserPreferences,
  updateUserPreferences,
  getUserPermissions,
  getAllUserRoles,
  getUsersWithRole,
  assignUserRole,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Login user

// Protected routes
router.get("/me", verifyToken, getCurrentUser); // Get current user details
router.put("/profile", verifyToken, updateUserProfile); // Update user profile
router.put("/password", verifyToken, changePassword); // Change user password
router.get("/preferences", verifyToken, getUserPreferences); // Get user preferences
router.put("/preferences", verifyToken, updateUserPreferences); // Update user preferences
router.get("/permissions", verifyToken, getUserPermissions); // Get user permissions

// Admin-only routes
router.get("/roles", verifyToken, authorize("admin"), getAllUserRoles); // Get all user roles
router.get("/users/role/:roleId", verifyToken, authorize("admin"), getUsersWithRole); // Get users with a specific role
router.put("/users/:userId/role/:roleId", verifyToken, authorize("admin"), assignUserRole); // Assign a role to a user

// Role-specific dashboards
router.get("/admin-dashboard", verifyToken, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard data",
    data: {
      totalUsers: 100,
      activeUsers: 80,
      recentActivity: [
        { id: 1, action: "User created", timestamp: new Date() },
        { id: 2, action: "User updated", timestamp: new Date() },
      ],
    },
  });
});

router.get("/doctor-dashboard", verifyToken, authorize("doctor", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Doctor dashboard data",
    data: {
      appointments: [
        { id: 1, patient: "John Doe", time: "10:00 AM" },
        { id: 2, patient: "Jane Smith", time: "11:00 AM" },
      ],
      patients: [
        { id: 1, name: "John Doe", condition: "Stable" },
        { id: 2, name: "Jane Smith", condition: "Critical" },
      ],
    },
  });
});

router.get("/patient-dashboard", verifyToken, authorize("patient", "doctor", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Patient dashboard data",
    data: {
      appointments: [
        { id: 1, doctor: "Dr. Smith", time: "10:00 AM" },
        { id: 2, doctor: "Dr. Johnson", time: "11:00 AM" },
      ],
      prescriptions: [
        { id: 1, medication: "Paracetamol", dosage: "500mg" },
        { id: 2, medication: "Ibuprofen", dosage: "400mg" },
      ],
    },
  });
});

router.get("/reception-dashboard", verifyToken, authorize("reception", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Reception dashboard data",
    data: {
      appointments: [
        { id: 1, patient: "John Doe", doctor: "Dr. Smith", time: "10:00 AM" },
        { id: 2, patient: "Jane Smith", doctor: "Dr. Johnson", time: "11:00 AM" },
      ],
      patients: [
        { id: 1, name: "John Doe", status: "Checked In" },
        { id: 2, name: "Jane Smith", status: "Waiting" },
      ],
    },
  });
});

export default router;