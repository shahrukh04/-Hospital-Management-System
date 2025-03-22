import express from "express";
import adminController from "../controllers/adminController.js";
import patientController from "../controllers/patientController.js";
import appointmentController from "../controllers/appointmentController.js";
import recordController from "../controllers/recordController.js";
import labController from "../controllers/labController.js";
// import authController from "../controllers/authController.js";

import {
  requireAuth,
  requireAdmin,
  requireStaff,
  requireDoctor,
  requirePatient,
  requirePatientOrMedical,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/dashboard", requireAuth, requireAdmin, adminController.getDashboard);

// Staff routes
router.get("/staff/patients", requireAuth, requireStaff, patientController.getAllPatients);

// Doctor routes
router.post("/appointments/diagnose/:id", requireAuth, requireDoctor, appointmentController.addDiagnosis);

// Patient routes
router.get("/my-appointments", requireAuth, requirePatient, appointmentController.getMyAppointments);

// Mixed access routes
router.get("/patient/:patientId/records", requireAuth, requirePatientOrMedical, recordController.getPatientRecords);

// Using the generic authorize middleware
router.get("/lab-results", requireAuth, authorize('doctor', 'lab_technician', 'admin'), labController.getResults);

export default router;