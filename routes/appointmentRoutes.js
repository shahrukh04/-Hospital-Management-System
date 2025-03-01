import express from 'express';
import {
    getAllAppointments,
    getAppointment,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByDoctor,
    getAppointmentsByPatient,
    getTodaysAppointments,
    getUpcomingAppointments,

    rescheduleAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/today', getTodaysAppointments);
router.get('/upcoming', getUpcomingAppointments);
// ✅ Move this above `/:id`
router.get('/date/:date', getAppointmentsByDate);          // Fetch by date
router.get('/doctor/:doctorId', getAppointmentsByDoctor);  // Fetch by doctor
router.get('/patient/:patientId', getAppointmentsByPatient); // Fetch by patient
router.put('/:id/reschedule', rescheduleAppointment);        // Reschedule appointment
// Main CRUD
router.get('/', getAllAppointments);
router.get('/:id', getAppointment);
router.post('/', addAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

// Custom Endpoints

export default router;
