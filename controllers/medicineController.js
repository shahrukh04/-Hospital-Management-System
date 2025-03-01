import Medicine from "../models/Medicine.js";

// Search medicines
export const searchMedicines = async (req, res) => {
    try {
        const { query } = req.query;
        const medicines = await Medicine.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { manufacturer: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicines by category
export const getMedicinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const medicines = await Medicine.find({ category });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get low stock medicines
export const getLowStockMedicines = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const medicines = await Medicine.find({ stock: { $lte: threshold } });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicines expiring soon
export const getExpiringSoonMedicines = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const medicines = await Medicine.find({
            expiryDate: { $gte: new Date(), $lte: thirtyDaysFromNow }
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicine statistics
export const getMedicineStats = async (req, res) => {
    try {
        const stats = await Medicine.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalMedicines: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalStock: { $sum: "$stock" }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all medicines
export const getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single medicine
export const getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new medicine
export const addMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json({ message: "Medicine added successfully", data: medicine });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update medicine
export const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json({ message: "Medicine updated successfully", data: medicine });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete medicine
export const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json({ message: "Medicine deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicine count
export const getMedicineCount = async (req, res) => {
    try {
        const count = await Medicine.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
