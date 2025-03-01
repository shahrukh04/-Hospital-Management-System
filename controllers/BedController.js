import Bed from "../models/Bed.js";

// ✅ Total Beds Count
export const getTotalBeds = async (req, res) => {
    try {
        const count = await Bed.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch total beds count', error: error.message });
    }
};

// ✅ Occupied Beds Count
export const getOccupiedBeds = async (req, res) => {
    try {
        const count = await Bed.countDocuments({ status: 'occupied' });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch occupied beds count', error: error.message });
    }
};

// ✅ Bed Occupancy Stats (grouped by department)
export const getBedOccupancyStats = async (req, res) => {
    try {
        const stats = await Bed.aggregate([
            {
                $group: {
                    _id: "$department",
                    totalBeds: { $sum: 1 },
                    occupiedBeds: { $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] } }
                }
            },
            {
                $project: {
                    department: "$_id",
                    totalBeds: 1,
                    occupiedBeds: 1,
                    availableBeds: { $subtract: ["$totalBeds", "$occupiedBeds"] },
                    occupancyRate: {
                        $cond: [
                            { $eq: ["$totalBeds", 0] },
                            0,
                            { $multiply: [{ $divide: ["$occupiedBeds", "$totalBeds"] }, 100] }
                        ]
                    }
                }
            }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bed occupancy stats', error: error.message });
    }
};

// ✅ Bed Stats for Specific Month (optional, if needed for monthly report)
export const getMonthlyBedStats = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required" });
        }

        const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const beds = await Bed.find({ updatedAt: { $gte: startDate, $lt: endDate } });

        const totalBeds = beds.length;
        const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
        const availableBeds = totalBeds - occupiedBeds;
        const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;

        res.status(200).json({
            totalBeds,
            occupiedBeds,
            availableBeds,
            occupancyRate
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching monthly bed stats", error: error.message });
    }
};
