const Medicine = require("../models/Medicine");

// Search medicines
const searchMedicines = async (req, res) => {
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
const getMedicinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const medicines = await Medicine.find({ category });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get low stock medicines
const getLowStockMedicines = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        const medicines = await Medicine.find({ stock: { $lte: threshold } });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicines expiring soon
const getExpiringSoonMedicines = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const medicines = await Medicine.find({
            expiryDate: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            }
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get medicine statistics
const getMedicineStats = async (req, res) => {
    try {
        const stats = await Medicine.aggregate([
            {
                $group: {
                    _id: null,
                    totalMedicines: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalStock: { $sum: "$stock" },
                    categoryCounts: {
                        $push: {
                            category: "$category",
                            count: 1
                        }
                    }
                }
            }
        ]);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all functions
module.exports = {
    searchMedicines,
    getMedicinesByCategory,
    getLowStockMedicines,
    getExpiringSoonMedicines,
    getMedicineStats
};
