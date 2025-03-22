import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  authorize,
  getCurrentUser
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", verifyToken, getCurrentUser);

// Role-specific routes examples
router.get("/admin-dashboard", verifyToken, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard data",
    data: { /* admin data */ }
  });
});

router.get("/doctor-dashboard", verifyToken, authorize("doctor", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Doctor dashboard data",
    data: { /* doctor data */ }
  });
});

router.get("/patient-dashboard", verifyToken, authorize("patient", "doctor", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Patient dashboard data",
    data: { /* patient data */ }
  });
});

router.get("/reception-dashboard", verifyToken, authorize("reception", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Reception dashboard data",
    data: { /* reception data */ }
  });
});

export default router;