const Prescription = require("../models/Prescription");
const Doctor = require("../models/Docoter");

// Get all prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find().populate("doctorId", "name specialization");
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new prescription
exports.addPrescription = async (req, res) => {
  try {
    const { doctorId, patientName, medicines } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) return res.status(404).json({ message: "Doctor not found" });

    const newPrescription = new Prescription({ doctorId, patientName, medicines });
    await newPrescription.save();

    res.status(201).json({ message: "Prescription added successfully", newPrescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { patientName, medicines } = req.body;
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { patientName, medicines },
      { new: true }
    );

    if (!updatedPrescription) return res.status(404).json({ message: "Prescription not found" });

    res.json({ message: "Prescription updated successfully", updatedPrescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!deletedPrescription) return res.status(404).json({ message: "Prescription not found" });

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
