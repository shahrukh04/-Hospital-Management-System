import express from 'express';
import {
    getAllDepartments,
    getDepartment,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentCount,
    getActiveDepartments
} from '../controllers/departmentController.js';

const router = express.Router();

router.get('/count', getDepartmentCount);      // Get total departments count
router.get('/active', getActiveDepartments);   // Get only active departments
router.get('/', getAllDepartments);            // Get all departments
router.get('/:id', getDepartment);             // Get single department
router.post('/', addDepartment);               // Add new department
router.put('/:id', updateDepartment);          // Update department
router.delete('/:id', deleteDepartment);       // Delete department

export default router;