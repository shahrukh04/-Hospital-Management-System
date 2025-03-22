import express from 'express';
import { requireAuth, requirePatientOrMedical } from '../middleware/authMiddleware.js';
import recordController from '../controllers/recordController.js';

const router = express.Router();

// Get all records for a patient
router.get("/patient/:patientId/records", requireAuth, requirePatientOrMedical, recordController.getPatientRecords);

// Get a specific record
router.get("/records/:recordId", requireAuth, requirePatientOrMedical, recordController.getRecordById);

// Create a new record for a patient
router.post("/patient/:patientId/records", requireAuth, requirePatientOrMedical, recordController.createRecord);

// Update a record
router.put("/records/:recordId", requireAuth, requirePatientOrMedical, recordController.updateRecord);

// Delete a record
router.delete("/records/:recordId", requireAuth, requirePatientOrMedical, recordController.deleteRecord);

// Get record statistics for a patient
router.get("/patient/:patientId/record-stats", requireAuth, requirePatientOrMedical, recordController.getRecordStats);

export default router;