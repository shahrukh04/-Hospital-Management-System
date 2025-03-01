import express from 'express';
import {
    getDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorCount
} from '../controllers/doctorController.js';

const router = express.Router();
// ✅ Get doctor count
router.get('/count', getDoctorCount);

// ✅ Get all doctors
router.get('/', getDoctors);

// ✅ Add new doctor
router.post('/', addDoctor);

// ✅ Update doctor by ID
router.put('/:id', updateDoctor);

// ✅ Delete doctor by ID
router.delete('/:id', deleteDoctor);

export default router;
