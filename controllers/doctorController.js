const Doctor = require("../models/Docoter");
// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add a new doctor
exports.addDoctor = async (req, res) => {
  try {
    const { name, specialization, email } = req.body;
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) return res.status(400).json({ message: "Doctor already exists" });
    const newDoctor = new Doctor({ name, specialization, email });
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", newDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a doctor's details
exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, { name, specialization }, { new: true });

    if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor updated successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete a doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!deletedDoctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
