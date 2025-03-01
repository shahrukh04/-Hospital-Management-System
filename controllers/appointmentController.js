import Appointment from '../models/Appointment.js';

// Get all appointments
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single appointment by ID
export const getAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await Appointment.findById(id).populate('patientId doctorId');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add new appointment
export const addAppointment = async (req, res) => {
    try {
        const newAppointment = await Appointment.create(req.body);
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update appointment
export const updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get appointments by date
export const getAppointmentsByDate = async (req, res) => {
    const { date } = req.params;
    try {
        const appointments = await Appointment.find({ date: new Date(date) }).populate('patientId doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get appointments by doctor
export const getAppointmentsByDoctor = async (req, res) => {
    const { doctorId } = req.params;
    try {
        const appointments = await Appointment.find({ doctorId }).populate('patientId doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get appointments by patient
export const getAppointmentsByPatient = async (req, res) => {
    const { patientId } = req.params;
    try {
        const appointments = await Appointment.find({ patientId }).populate('patientId doctorId');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get today's appointments
export const getTodaysAppointments = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('patientId doctorId');

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reschedule appointment (change date & time)
export const rescheduleAppointment = async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.date = date;
        appointment.time = time;
        await appointment.save();

        res.json({ message: 'Appointment rescheduled successfully', appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            date: { $gt: today }
        }).populate('patientId').populate('doctorId');

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
