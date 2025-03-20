import express from 'express';
import appointmentController from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { appointmentValidation } from '../middleware/validation.js';

const router = express.Router();

// Main CRUD operations
router.get('/', requireAuth, appointmentController.getAllAppointments);
router.get('/:id', requireAuth, appointmentController.getAppointmentById);
router.post('/', requireAuth, appointmentValidation, appointmentController.createAppointment);
router.put('/:id', requireAuth, appointmentValidation, appointmentController.updateAppointment);
router.delete('/:id', requireAuth, appointmentController.cancelAppointment); // Using cancel instead of delete

// Custom endpoints
router.get('/available', requireAuth, appointmentController.getAvailableTimeSlots);
router.get('/statistics', requireAuth, appointmentController.getAppointmentStatistics);

// Patient-specific routes
router.get('/patient/:patientId', requireAuth, appointmentController.getPatientAppointments);

// Doctor-specific routes
router.get('/doctor/:doctorId/schedule', requireAuth, appointmentController.getDoctorSchedule);

// Date-specific routes - these will use the getAllAppointments with appropriate filters
router.get('/date/:date', requireAuth, (req, res) => {
  req.query.date = req.params.date;
  return appointmentController.getAllAppointments(req, res);
});

// Appointment actions
router.put('/:id/cancel', requireAuth, appointmentController.cancelAppointment);
router.post('/:id/reminder', requireAuth, appointmentController.sendAppointmentReminder);

export default router;