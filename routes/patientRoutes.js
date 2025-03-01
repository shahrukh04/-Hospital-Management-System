import express from 'express';
import {
    getAllPatients,
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientCount,
    getCriticalPatients
} from '../controllers/patientController.js';

const router = express.Router();

router.get('/count', getPatientCount);    // ✅ Patient count
router.get('/critical', getCriticalPatients);  // ✅ Moved here
router.get('/', getAllPatients);          // ✅ Get all patients
router.get('/:id', getPatient);           // ✅ Get single patient
router.post('/', addPatient);             // ✅ Add new patient
router.put('/:id', updatePatient);        // ✅ Update patient
router.delete('/:id', deletePatient);     // ✅ Delete patient

export default router;
