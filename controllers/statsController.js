import Patient from "../models/patientModel.js";
import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import FinancialStats from "../models/FinancialStats.js";
import DistributionStats from "../models/DistributionStats.js";
import DemographicsStats from "../models/DemographicsStats.js";
import PerformanceMetrics from "../models/PerformanceMetrics.js";

export const getMonthlyStats = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required" });
        }

        const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const patients = await Patient.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const prescriptions = await Prescription.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const doctors = await Doctor.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const financialStats = await FinancialStats.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const distributionStats = await DistributionStats.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const demographicsStats = await DemographicsStats.find({ createdAt: { $gte: startDate, $lt: endDate } });
        const performanceMetrics = await PerformanceMetrics.find({ createdAt: { $gte: startDate, $lt: endDate } });

        res.json({
            success: true,
            data: {
                patients,
                prescriptions,
                doctors,
                financialStats,
                distributionStats,
                demographicsStats,
                performanceMetrics
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching monthly stats", error: error.message });
    }
};
