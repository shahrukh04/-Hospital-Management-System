import LabTest from '../models/LabTest.js';

export const getAllLabTests = async (req, res) => {
    try {
        const labTests = await LabTest.find();
        res.json(labTests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLabTest = async (req, res) => {
    try {
        const labTest = await LabTest.findById(req.params.id);
        if (!labTest) {
            return res.status(404).json({ message: 'Lab test not found' });
        }
        res.json(labTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const orderLabTest = async (req, res) => {
    try {
        const newLabTest = await LabTest.create(req.body);
        res.status(201).json(newLabTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLabTestStatus = async (req, res) => {
    try {
        const updatedLabTest = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLabTest) {
            return res.status(404).json({ message: 'Lab test not found' });
        }
        res.json(updatedLabTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
