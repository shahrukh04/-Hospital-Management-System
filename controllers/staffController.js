import Staff from '../models/Staff.js';  // ✅ Import Staff model with .js extension for ESM

export const getAllStaff = async (req, res) => {
    const staff = await Staff.find();
    res.json(staff);
};

export const getStaff = async (req, res) => {
    const staff = await Staff.findById(req.params.id);
    res.json(staff);
};

export const addStaff = async (req, res) => {
    const newStaff = await Staff.create(req.body);
    res.status(201).json(newStaff);
};

export const updateStaff = async (req, res) => {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStaff);
};

export const deleteStaff = async (req, res) => {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted' });
};
