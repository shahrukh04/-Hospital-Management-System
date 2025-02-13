const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

let prescriptionCollection, doctorCollection;

// Middleware to inject the collections
router.use((req, res, next) => {
    prescriptionCollection = req.app.locals.prescriptionCollection;
    doctorCollection = req.app.locals.doctorCollection;
    next();
});

// GET all prescriptions
router.get("/", async (req, res) => {
    try {
        const prescriptions = await prescriptionCollection.find({}).toArray();
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single prescription by ID
router.get("/:id", async (req, res) => {
    try {
        const prescription = await prescriptionCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!prescription) return res.status(404).json({ message: "Prescription not found" });
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new prescription
router.post("/", async (req, res) => {
    try {
        const { doctorId, patientName, medicines } = req.body;
        if (!doctorId || !patientName || !medicines) return res.status(400).json({ message: "All fields are required" });

        const doctor = await doctorCollection.findOne({ _id: new ObjectId(doctorId) });
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const newPrescription = { ...req.body, createdAt: new Date(), status: "active" };
        const result = await prescriptionCollection.insertOne(newPrescription);
        res.status(201).json({ message: "Prescription created successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE prescription
router.put("/:id", async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: new Date() };
        const result = await prescriptionCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
        if (result.matchedCount === 0) return res.status(404).json({ message: "Prescription not found" });
        res.json({ message: "Prescription updated successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE prescription
router.delete("/:id", async (req, res) => {
    try {
        const result = await prescriptionCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Prescription not found" });
        res.json({ message: "Prescription deleted successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
