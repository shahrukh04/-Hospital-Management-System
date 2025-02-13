// medicineRoutes.js
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

// Middleware to access collection
router.use((req, res, next) => {
    medicineCollection = req.app.locals.medicineCollection;
    next();
});

// GET all medicines
router.get('/', async (req, res) => {
    try {
        if (!medicineCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }
        const medicines = await medicineCollection.find({}).toArray();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single medicine by ID
router.get('/:id', async (req, res) => {
    try {
        if (!medicineCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }
        const medicine = await medicineCollection.findOne({
            _id: new ObjectId(req.params.id)
        });
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new medicine
router.post('/', async (req, res) => {
    try {
        if (!medicineCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }
        const newMedicine = req.body;
        if (!newMedicine.name) {
            return res.status(400).json({ message: "Medicine name is required" });
        }
        newMedicine.createdAt = new Date();
        const result = await medicineCollection.insertOne(newMedicine);
        res.status(201).json({
            message: "Medicine added successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE medicine
router.put('/:id', async (req, res) => {
    try {
        if (!medicineCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }
        const updates = req.body;
        updates.updatedAt = new Date();
        const result = await medicineCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json({
            message: "Medicine updated successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE medicine
router.delete('/:id', async (req, res) => {
    try {
        if (!medicineCollection) {
            return res.status(500).json({ message: "Database connection not established" });
        }
        const result = await medicineCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json({
            message: "Medicine deleted successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;