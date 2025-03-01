import Doctor from "../models/Doctor.js";

// ✅ Get all doctors
export const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Add a new doctor
export const addDoctor = async (req, res) => {
    try {
        const { name, specialization, email } = req.body;

        // Check if doctor already exists by email
        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ message: "Doctor already exists" });
        }

        // Create new doctor
        const newDoctor = new Doctor({ name, specialization, email });
        await newDoctor.save();

        res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update a doctor's details
export const updateDoctor = async (req, res) => {
    try {
        const { name, specialization } = req.body;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { name, specialization },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete a doctor
export const deleteDoctor = async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!deletedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get total doctor count
export const getDoctorCount = async (req, res) => {
  try {
      const count = await Doctor.countDocuments();
      res.json({ count });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
