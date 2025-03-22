import express from "express";

// ✅ Import all routes
import authRoutes from "./authRoutes.js";
import doctorRoutes from "./doctorRoutes.js";
import prescriptionRoutes from "./prescriptionRoutes.js";
import medicineRoutes from "./medicineRoutes.js";  // Ensure this is the new Mongoose-based version
import statsRoutes from "./statsRoutes.js";
import patientRoutes from "./patientRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import billingRoutes from "./billingRoutes.js";
import staffRoutes from "./staffRoutes.js";
import labRoutes from "./labRoutes.js";
import emergencyRoutes from "./emergencyRoutes.js";   // ✅ Already imported
import bedRoutes from "./bedRoutes.js";
import accessRoutes from "./accessRoutes.js";
import patientRecordsRoute from "./patientRecordsRoute.js";  // ✅ Corrected file name
import departmentRoute from './departmentRoute.js';
const router = express.Router();

// ✅ Use `router.use()` to mount routes
router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/medicines", medicineRoutes);  // Make sure this points to your new Mongoose-based medicine routes
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/bills", billingRoutes);
router.use("/staff", staffRoutes);
router.use("/labs", labRoutes);
router.use("/emergency", emergencyRoutes);   // ✅ Removed "s" - corrected to match frontend
router.use("/beds", bedRoutes);
router.use('/api/beds', bedRoutes);       // For bed-related endpoints
router.use('/api/stats', statsRoutes);
router.use('/access', accessRoutes);
router.use('/patientRecords', patientRecordsRoute);
router.use('/departments', departmentRoute);
// ✅ Welcome Route
router.get("/", (req, res) => res.send("Welcome to Hospital Management API"));

export default router;
