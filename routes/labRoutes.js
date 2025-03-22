import express from 'express';
import { requireAuth, authorize } from '../middleware/authMiddleware.js';
import labController from '../controllers/labController.js';

const router = express.Router();

// Get all lab results
router.get("/lab-results", requireAuth, authorize('doctor', 'lab_technician', 'admin'), labController.getResults);

// Get all lab tests
router.get("/lab-tests", requireAuth, authorize('doctor', 'lab_technician', 'admin'), labController.getAllLabTests);

// Get a specific lab test
router.get("/lab-tests/:id", requireAuth, authorize('doctor', 'lab_technician', 'admin', 'patient'), labController.getLabTest);

// Order a new lab test
router.post("/lab-tests", requireAuth, authorize('doctor', 'admin'), labController.orderLabTest);

// Update lab test status
router.put("/lab-tests/:id", requireAuth, authorize('lab_technician', 'admin'), labController.updateLabTestStatus);

// Delete a lab test
router.delete("/lab-tests/:id", requireAuth, authorize('doctor', 'admin'), labController.deleteLabTest);

// Get lab statistics
router.get("/lab-stats", requireAuth, authorize('admin', 'lab_technician'), labController.getLabStats);

export default router;