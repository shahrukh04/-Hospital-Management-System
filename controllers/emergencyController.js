import Emergency from '../models/Emergency.js';  // Ensure Emergency.js is also an ESM module

export const getAllEmergencies = async (req, res) => {
    try {
        const emergencies = await Emergency.find();
        res.json(emergencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }
        res.json(emergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addEmergency = async (req, res) => {
    try {
        const newEmergency = await Emergency.create(req.body);
        res.status(201).json(newEmergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEmergency = async (req, res) => {
    try {
        const updatedEmergency = await Emergency.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }
        res.json(updatedEmergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findByIdAndDelete(req.params.id);
        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }
        res.json({ message: 'Emergency deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEmergencyCount = async (req, res) => {
    try {
        const count = await Emergency.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getEmergencyAlerts = async (req, res) => {
    try {
        const alerts = await Emergency.find({ status: 'reported' });  // Example filter - adjust if needed
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
