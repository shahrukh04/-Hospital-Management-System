import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";  // Make sure your file name is exactly "Doctor.js"

// ✅ Get all prescriptions
export const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find()
            .populate("doctorId", "name specialization");  // Make sure your Doctor model has 'name' and 'specialization'
        res.json(prescriptions);
    } catch (error) {
        console.error("Error getting prescriptions:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// ✅ Get prescription count
export const getPrescriptionCount = async (req, res) => {
    try {
        const count = await Prescription.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error("Error getting prescription count:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// ✅ Add a new prescription
export const addPrescription = async (req, res) => {
    try {
        const { doctorId, patientName, patientAge, instructions, medicines } = req.body;

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // ✅ Extract only `medicineName` if medicines are objects (frontend might send objects)
        const medicineNames = medicines.map(med => med.medicineName || med);

        const newPrescription = new Prescription({
            doctorId,
            patientName,
            patientAge,
            instructions,
            medicines: medicineNames,  // Only save medicine names
            status: "active"
        });

        await newPrescription.save();

        res.status(201).json({ message: "Prescription added successfully", prescription: newPrescription });
    } catch (error) {
        console.error("Error adding prescription:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// ✅ Update a prescription
export const updatePrescription = async (req, res) => {
    try {
        const { patientName, patientAge, instructions, medicines } = req.body;

        // ✅ Extract medicine names again
        const medicineNames = medicines.map(med => med.medicineName || med);

        const updatedPrescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { patientName, patientAge, instructions, medicines: medicineNames },
            { new: true }
        );

        if (!updatedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        res.json({ message: "Prescription updated successfully", prescription: updatedPrescription });
    } catch (error) {
        console.error("Error updating prescription:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// ✅ Delete a prescription
export const deletePrescription = async (req, res) => {
    try {
        const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);

        if (!deletedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        res.json({ message: "Prescription deleted successfully" });
    } catch (error) {
        console.error("Error deleting prescription:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
