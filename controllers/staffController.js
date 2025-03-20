import Staff from '../models/Staff.js'; // ✅ Import Staff model with .js extension for ESM

// Get all staff members
export const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find();
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch staff members", error });
    }
};

// Get a specific staff member by ID
export const getStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch staff member", error });
    }
};

// Add a new staff member
export const addStaff = async (req, res) => {
    try {
        const newStaff = await Staff.create(req.body);
        res.status(201).json(newStaff);
    } catch (error) {
        res.status(500).json({ message: "Failed to add staff member", error });
    }
};

// Update a staff member by ID
export const updateStaff = async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStaff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        res.status(200).json(updatedStaff);
    } catch (error) {
        res.status(500).json({ message: "Failed to update staff member", error });
    }
};

// Delete a staff member by ID
export const deleteStaff = async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        res.status(200).json({ message: "Staff member deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete staff member", error });
    }
};

// Add attendance for a staff member
export const addAttendance = async (req, res) => {
    try {
        const { staffId, date, status } = req.body;
        const staff = await Staff.findById(staffId);

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Validate attendance status
        const validStatuses = ['Present', 'Absent', 'Late', 'On Leave'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid attendance status" });
        }

        staff.attendance.push({ date, status });
        await staff.save();

        res.status(200).json({ message: "Attendance added successfully", attendance: staff.attendance });
    } catch (error) {
        res.status(500).json({ message: "Failed to add attendance", error });
    }
};

// Get attendance for a specific staff member
export const getAttendance = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await Staff.findById(staffId);

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        res.status(200).json(staff.attendance);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch attendance", error });
    }
};

// Update a specific attendance record for a staff member
export const updateAttendance = async (req, res) => {
    try {
        const { staffId, attendanceId } = req.params;
        const { status } = req.body;

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Validate attendance status
        const validStatuses = ['Present', 'Absent', 'Late', 'On Leave'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid attendance status" });
        }

        // Find the attendance record to update
        const attendanceRecord = staff.attendance.id(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        // Update the status
        attendanceRecord.status = status;
        await staff.save();

        res.status(200).json({ message: "Attendance updated successfully", attendance: staff.attendance });
    } catch (error) {
        res.status(500).json({ message: "Failed to update attendance", error });
    }
};

// Delete a specific attendance record for a staff member
export const deleteAttendance = async (req, res) => {
    try {
        const { staffId, attendanceId } = req.params;

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Find the attendance record to delete
        const attendanceRecord = staff.attendance.id(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        // Remove the attendance record
        staff.attendance.pull(attendanceId);
        await staff.save();

        res.status(200).json({ message: "Attendance deleted successfully", attendance: staff.attendance });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete attendance", error });
    }
};

// Update a staff member's schedule
export const updateSchedule = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { schedule } = req.body;

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Validate schedule days and shifts
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const validShifts = ['Morning', 'Afternoon', 'Night'];

        for (const entry of schedule) {
            if (!validDays.includes(entry.day) || !validShifts.includes(entry.shift)) {
                return res.status(400).json({ message: "Invalid schedule entry" });
            }
        }

        staff.schedule = schedule;
        await staff.save();

        res.status(200).json({ message: "Schedule updated successfully", schedule: staff.schedule });
    } catch (error) {
        res.status(500).json({ message: "Failed to update schedule", error });
    }
};

// Get a staff member's schedule
export const getSchedule = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await Staff.findById(staffId);

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        res.status(200).json(staff.schedule);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch schedule", error });
    }
};