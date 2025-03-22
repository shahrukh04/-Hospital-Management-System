import mongoose from 'mongoose';
import Department from '../models/Department.js';

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        let department;
        
        if (mongoose.Types.ObjectId.isValid(id)) {
            department = await Department.findById(id);
        } else {
            department = await Department.findOne({ name: id }); // Can find by name
        }
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addDepartment = async (req, res) => {
    try {
        const newDepartment = await Department.create(req.body);
        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
        
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDepartmentCount = async (req, res) => {
    try {
        const count = await Department.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getActiveDepartments = async (req, res) => {
    try {
        const activeDepartments = await Department.find({ active: true });
        res.json(activeDepartments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add this default export to fix the import error
export default {
    getAllDepartments,
    getDepartment,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentCount,
    getActiveDepartments
};