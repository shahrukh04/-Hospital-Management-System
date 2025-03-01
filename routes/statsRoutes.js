import express from "express";
import {
    getMonthlyStats,
    getDistributionStats,
    getBedOccupancyStats,
    getFinancialStats,
    getDemographicsStats,
    getPerformanceMetrics
} from "../controllers/statsController.js";

const router = express.Router();

// Get monthly stats for all collections (filtered by year and month)
router.get("/monthly", getMonthlyStats);

// Individual endpoints for specific stats types (if needed separately)
router.get("/distribution", getDistributionStats);
router.get("/bed-occupancy", getBedOccupancyStats);
router.get("/financial", getFinancialStats);
router.get("/demographics", getDemographicsStats);
router.get("/performance", getPerformanceMetrics);

export default router;
