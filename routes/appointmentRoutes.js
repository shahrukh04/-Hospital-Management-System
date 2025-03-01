import express from 'express';
import {
    getAllAppointments,
    getAppointment,
    addAppointment,
    updateAppointment,
    deleteAppointment
} from '../controllers/appointmentController.js';  // Make sure your controller file is also .js and uses ESM

const router = express.Router();

router.get('/', getAllAppointments);
router.get('/:id', getAppointment);
router.post('/', addAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
