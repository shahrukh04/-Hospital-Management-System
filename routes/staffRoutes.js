import { Router } from 'express';
import {
    getAllStaff,
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    addAttendance,
    getAttendance,
    updateAttendance,
    deleteAttendance,
    updateSchedule,
    getSchedule
} from '../controllers/staffController.js';  // ✅ Use .js extension for ESM

const router = Router();

// Staff CRUD routes
router.get('/', getAllStaff); // Get all staff members
router.get('/:id', getStaff); // Get a specific staff member by ID
router.post('/', addStaff); // Add a new staff member
router.put('/:id', updateStaff); // Update a staff member by ID
router.delete('/:id', deleteStaff); // Delete a staff member by ID

// Attendance routes
router.post('/attendance', addAttendance); // Add attendance for a staff member
router.get('/:staffId/attendance', getAttendance); // Get attendance for a specific staff member
router.put('/:staffId/attendance/:attendanceId', updateAttendance); // Update a specific attendance record
router.delete('/:staffId/attendance/:attendanceId', deleteAttendance); // Delete a specific attendance record

// Schedule routes
router.put('/:staffId/schedule', updateSchedule); // Update a staff member's schedule
router.get('/:staffId/schedule', getSchedule); // Get a staff member's schedule

export default router;