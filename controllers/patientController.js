import mongoose from 'mongoose';
import Patient from '../models/patientModel.js';  // ✅ Note the file name change here

export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPatient = async (req, res) => {
    try {
        const { id } = req.params;

        let patient;

        if (mongoose.Types.ObjectId.isValid(id)) {
            patient = await Patient.findById(id);
        } else {
            patient = await Patient.findOne({ status: id });  // Adjust logic if needed
        }

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addPatient = async (req, res) => {
    try {
        const newPatient = await Patient.create(req.body);
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPatient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePatient = async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPatientCount = async (req, res) => {
    try {
        const count = await Patient.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCriticalPatients = async (req, res) => {
    try {
        const criticalPatients = await Patient.find({ criticalStatus: true });
        res.json(criticalPatients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


