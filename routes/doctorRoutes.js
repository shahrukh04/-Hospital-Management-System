const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

let doctorCollection;

// Middleware to inject the collection
router.use((req, res, next) => {
    doctorCollection = req.app.locals.doctorCollection;
    next();
});

// GET all doctors
router.get("/", async (req, res) => {
    try {
        const doctors = await doctorCollection.find({}).toArray();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single doctor by ID
router.get("/:id", async (req, res) => {
    try {
        const doctor = await doctorCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new doctor
router.post("/", async (req, res) => {
    try {
        const newDoctor = { ...req.body, createdAt: new Date() };
        const result = await doctorCollection.insertOne(newDoctor);
        res.status(201).json({ message: "Doctor added successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE doctor
router.put("/:id", async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: new Date() };
        const result = await doctorCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
        if (result.matchedCount === 0) return res.status(404).json({ message: "Doctor not found" });
        res.json({ message: "Doctor updated successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE doctor
router.delete("/:id", async (req, res) => {
    try {
        const result = await doctorCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Doctor not found" });
        res.json({ message: "Doctor deleted successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
