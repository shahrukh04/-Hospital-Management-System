import Appointment from '../models/Appointment.js';
import Patient from '../models/patientModel.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

class AppointmentController {
  /**
   * Get all appointments with pagination and filtering
   * @route GET /api/appointments
   */
  async getAllAppointments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        date,
        doctorId,
        patientId,
        startDate,
        endDate,
      } = req.query;

      // Build filter object
      const filter = {};

      if (status) filter.status = status;
      if (doctorId) filter.doctorId = doctorId;
      if (patientId) filter.patientId = patientId;
      if (date) filter.date = new Date(date);

      // Date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      // Execute query with pagination
      const appointments = await Appointment.find(filter)
        .populate('patient', 'name phone insuranceDetails') // Include insuranceDetails
        .populate('doctor', 'name specialization')
        .populate('department', 'name')
        .sort({ date: -1, startTime: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      // Count total documents for pagination metadata
      const totalCount = await Appointment.countDocuments(filter);

      return res.status(200).json({
        success: true,
        count: appointments.length,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        data: appointments,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching appointments',
        error: error.message,
      });
    }
  }

  /**
   * Get a single appointment by ID
   * @route GET /api/appointments/:id
   */
  async getAppointmentById(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'name phone email dateOfBirth insuranceDetails') // Include insuranceDetails
        .populate('doctor', 'name specialization department')
        .populate('department', 'name location')
        .populate('createdBy', 'firstName lastName role');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching appointment',
        error: error.message,
      });
    }
  }

  /**
   * Create a new appointment
   * @route POST /api/appointments
   */
  async createAppointment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        patientId,
        doctorId,
        departmentId,
        appointmentType,
        date,
        startTime,
        endTime,
        duration,
        reason,
        priority,
        notes,
        insurance, // Include insurance details
      } = req.body;

      // Verify patient exists
      const patient = await Patient.findById(patientId).session(session);
      if (!patient) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Verify doctor exists
      const doctor = await Doctor.findById(doctorId).session(session);
      if (!doctor) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      // Check doctor availability
      const appointmentDate = new Date(date);
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: {
          $gte: new Date(appointmentDate.setHours(0, 0, 0)),
          $lt: new Date(appointmentDate.setHours(23, 59, 59)),
        },
        status: { $nin: ['cancelled', 'no-show'] },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
      }).session(session);

      if (existingAppointment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'The selected time slot conflicts with an existing appointment',
        });
      }

      // Create new appointment
      const appointment = new Appointment({
        patientId,
        doctorId,
        departmentId,
        appointmentType,
        date,
        startTime,
        endTime,
        duration,
        reason,
        priority: priority || 'medium',
        notes,
        insurance, // Include insurance details
        createdBy: req.user.id, // Assuming user info is attached by auth middleware
      });

      await appointment.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating appointment',
        error: error.message,
      });
    }
  }

  /**
   * Update an existing appointment
   * @route PUT /api/appointments/:id
   */
  async updateAppointment(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateData = { ...req.body };

      // Prevent updating certain fields
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      // Add updatedBy field
      updateData.updatedBy = req.user.id; // Assuming user info is attached by auth middleware

      // Check if appointment exists
      let appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // If changing date/time, check for conflicts
      if (
        (updateData.date || updateData.startTime || updateData.endTime) &&
        updateData.status !== 'cancelled' &&
        appointment.status !== 'cancelled'
      ) {
        const doctorId = updateData.doctorId || appointment.doctorId;
        const date = updateData.date || appointment.date;
        const startTime = updateData.startTime || appointment.startTime;
        const endTime = updateData.endTime || appointment.endTime;

        const appointmentDate = new Date(date);
        const existingAppointment = await Appointment.findOne({
          _id: { $ne: id }, // Exclude current appointment
          doctorId,
          date: {
            $gte: new Date(appointmentDate.setHours(0, 0, 0)),
            $lt: new Date(appointmentDate.setHours(23, 59, 59)),
          },
          status: { $nin: ['cancelled', 'no-show'] },
          $or: [
            {
              startTime: { $lt: endTime },
              endTime: { $gt: startTime },
            },
          ],
        });

        if (existingAppointment) {
          return res.status(400).json({
            success: false,
            message: 'The selected time slot conflicts with an existing appointment',
          });
        }
      }

      // Update appointment
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('patient', 'name phone insuranceDetails') // Include insuranceDetails
        .populate('doctor', 'name specialization');

      return res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment updated successfully',
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating appointment',
        error: error.message,
      });
    }
  }

  /**
   * Cancel an appointment
   * @route PUT /api/appointments/:id/cancel
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required',
        });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Use the model's cancel method
      await appointment.cancel(cancellationReason, req.user.id);

      return res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while cancelling appointment',
        error: error.message,
      });
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   * @route GET /api/appointments/available
   */
  async getAvailableTimeSlots(req, res) {
    try {
      const { doctorId, date, duration = 30 } = req.query;

      if (!doctorId || !date) {
        return res.status(400).json({
          success: false,
          message: 'Doctor ID and date are required',
        });
      }

      // Fetch doctor working hours (assuming Doctor model has workingHours field)
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
      }

      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Find doctor's working hours for this day
      const workingHours = doctor.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
      if (!workingHours || !workingHours.isWorking) {
        return res.status(200).json({
          success: true,
          message: 'Doctor is not available on this day',
          data: [],
        });
      }

      // Get all appointments for this doctor on this date
      const appointments = await Appointment.find({
        doctorId,
        date: {
          $gte: new Date(selectedDate.setHours(0, 0, 0)),
          $lt: new Date(selectedDate.setHours(23, 59, 59)),
        },
        status: { $nin: ['cancelled', 'no-show'] },
      }).sort({ startTime: 1 });

      // Calculate available slots
      const startTime = workingHours.startTime; // Format: "09:00"
      const endTime = workingHours.endTime; // Format: "17:00"

      // Convert working hours to minutes since midnight for easier calculation
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

      // Create array of busy time ranges
      const busyTimeRanges = appointments.map((app) => {
        const appStartMinutes = parseInt(app.startTime.split(':')[0]) * 60 + parseInt(app.startTime.split(':')[1]);
        const appEndMinutes = parseInt(app.endTime.split(':')[0]) * 60 + parseInt(app.endTime.split(':')[1]);
        return { start: appStartMinutes, end: appEndMinutes };
      });

      // Calculate available slots
      const availableSlots = [];
      let currentMinute = startMinutes;

      while (currentMinute + parseInt(duration) <= endMinutes) {
        // Check if this time slot overlaps with any busy time range
        const isOverlapping = busyTimeRanges.some(
          (range) => !(currentMinute + parseInt(duration) <= range.start || currentMinute >= range.end)
        );

        if (!isOverlapping) {
          // Convert minutes back to HH:MM format
          const slotStartHour = Math.floor(currentMinute / 60).toString().padStart(2, '0');
          const slotStartMinute = (currentMinute % 60).toString().padStart(2, '0');

          const slotEndMinute = currentMinute + parseInt(duration);
          const slotEndHour = Math.floor(slotEndMinute / 60).toString().padStart(2, '0');
          const slotEndMin = (slotEndMinute % 60).toString().padStart(2, '0');

          availableSlots.push({
            startTime: `${slotStartHour}:${slotStartMinute}`,
            endTime: `${slotEndHour}:${slotEndMin}`,
            duration: parseInt(duration),
          });
        }

        // Move to next slot (typical slot intervals are 15 or 30 minutes)
        currentMinute += 15; // Can be adjusted based on hospital policy
      }

      return res.status(200).json({
        success: true,
        data: {
          date: date,
          doctorId: doctorId,
          doctorName: `${doctor.name}`,
          availableSlots: availableSlots,
        },
      });
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching available time slots',
        error: error.message,
      });
    }
  }

  /**
   * Get appointments for a specific patient
   * @route GET /api/patients/:patientId/appointments
   */
  async getPatientAppointments(req, res) {
    try {
      const { patientId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Build filter
      const filter = { patientId };
      if (status) filter.status = status;

      // Fetch appointments with pagination
      const appointments = await Appointment.find(filter)
        .populate('doctor', 'name specialization')
        .populate('department', 'name')
        .populate('patient', 'name phone insuranceDetails') // Include insuranceDetails
        .sort({ date: -1, startTime: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const totalCount = await Appointment.countDocuments(filter);

      return res.status(200).json({
        success: true,
        count: appointments.length,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        data: appointments,
      });
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching patient appointments',
        error: error.message,
      });
    }
  }

  /**
   * Get schedule for a specific doctor
   * @route GET /api/doctors/:doctorId/schedule
   */
  async getDoctorSchedule(req, res) {
    try {
      const { doctorId } = req.params;
      const { date, startDate, endDate } = req.query;

      // Build filter
      const filter = { doctorId };

      // Single date or date range
      if (date) {
        const selectedDate = new Date(date);
        filter.date = {
          $gte: new Date(selectedDate.setHours(0, 0, 0)),
          $lt: new Date(selectedDate.setHours(23, 59, 59)),
        };
      } else if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      // Get appointments
      const appointments = await Appointment.find(filter)
        .populate('patient', 'name phone insuranceDetails') // Include insuranceDetails
        .sort({ date: 1, startTime: 1 });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching doctor schedule',
        error: error.message,
      });
    }
  }

  /**
   * Add diagnosis to an appointment
   * @route POST /api/appointments/diagnose/:id
   */
  async addDiagnosis(req, res) {
    try {
      const { id } = req.params;
      const { diagnosis, treatment, prescriptions, notes } = req.body;

      // Find the appointment
      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Update the appointment with diagnosis information
      appointment.diagnosis = diagnosis;
      appointment.treatment = treatment;
      appointment.prescriptions = prescriptions;
      appointment.medicalNotes = notes;
      appointment.diagnosedBy = req.user.id
      appointment.diagnosedAt = new Date();
      appointment.status = 'completed'; // Update status to completed

      await appointment.save();

      return res.status(200).json({
        success: true,
        data: appointment,
        message: 'Diagnosis added successfully',
      });
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while adding diagnosis',
        error: error.message,
      });
    }
  }

  /**
   * Get current patient's appointments
   * @route GET /api/my-appointments
   */
  async getMyAppointments(req, res) {
    try {
      const patientId = req.user.id; // Assuming patient ID is available from auth middleware
      const { status, page = 1, limit = 10 } = req.query;

      // Build filter
      const filter = { patientId };
      if (status) filter.status = status;

      // Fetch appointments with pagination
      const appointments = await Appointment.find(filter)
        .populate('doctor', 'name specialization')
        .populate('department', 'name')
        .populate('patient', 'name phone insuranceDetails') // Include insuranceDetails
        .sort({ date: -1, startTime: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const totalCount = await Appointment.countDocuments(filter);

      return res.status(200).json({
        success: true,
        count: appointments.length,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        data: appointments,
      });
    } catch (error) {
      console.error('Error fetching my appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching your appointments',
        error: error.message,
      });
    }
  }

  /**
   * Send reminder for an appointment
   * @route POST /api/appointments/:id/reminder
   */
  async sendAppointmentReminder(req, res) {
    try {
      const { id } = req.params;
      const { type = 'email' } = req.body;

      const appointment = await Appointment.findById(id)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Here you would integrate with your notification service
      // This is a simplified placeholder
      const notificationSent = true; // placeholder for actual notification service
      let notificationStatus = 'sent';

      if (!notificationSent) {
        notificationStatus = 'failed';
      }

      // Log the reminder in appointment
      appointment.reminders.push({
        type,
        sentAt: new Date(),
        status: notificationStatus,
      });

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: `Reminder ${notificationStatus} successfully`,
        data: appointment,
      });
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while sending appointment reminder',
        error: error.message,
      });
    }
  }

  /**
   * Get dashboard statistics
   * @route GET /api/appointments/statistics
   */
  async getAppointmentStatistics(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's appointments
      const todayAppointments = await Appointment.countDocuments({
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      // Get pending appointments
      const pendingAppointments = await Appointment.countDocuments({
        status: { $in: ['scheduled', 'confirmed'] },
      });

      // Get completion rate for this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const monthlyAppointments = await Appointment.countDocuments({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      const completedAppointments = await Appointment.countDocuments({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        status: 'completed',
      });

      const completionRate = monthlyAppointments > 0
        ? (completedAppointments / monthlyAppointments) * 100
        : 0;

      // Get no-show rate
      const noShowAppointments = await Appointment.countDocuments({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        status: 'no-show',
      });

      const noShowRate = monthlyAppointments > 0
        ? (noShowAppointments / monthlyAppointments) * 100
        : 0;

      // Get busiest day of week
      const pipeline = [
        {
          $match: {
            date: { $gte: new Date(today.getFullYear(), today.getMonth() - 1, 1) },
          },
        },
        {
          $project: {
            dayOfWeek: { $dayOfWeek: '$date' },
          },
        },
        {
          $group: {
            _id: '$dayOfWeek',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 1,
        },
      ];

      const busiestDayResult = await Appointment.aggregate(pipeline);

      // Convert day number to name (1 = Sunday, 2 = Monday, etc.)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const busiestDay = busiestDayResult.length > 0
        ? dayNames[busiestDayResult[0]._id - 1]
        : 'N/A';

      return res.status(200).json({
        success: true,
        data: {
          todayAppointments,
          pendingAppointments,
          completionRate: completionRate.toFixed(2),
          noShowRate: noShowRate.toFixed(2),
          monthlyAppointments,
          busiestDay,
        },
      });
    } catch (error) {
      console.error('Error generating appointment statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while generating appointment statistics',
        error: error.message,
      });
    }
  }
}

export default new AppointmentController();