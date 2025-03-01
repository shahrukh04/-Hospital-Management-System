import express from 'express';
import {
    getTotalBeds,
    getOccupiedBeds,
    getBedOccupancyStats,
    getMonthlyBedStats
} from '../controllers/BedController.js';

const router = express.Router();

router.get('/total', getTotalBeds);
router.get('/occupied', getOccupiedBeds);
router.get('/occupancy-stats', getBedOccupancyStats);
router.get('/monthly-stats', getMonthlyBedStats);  // optional if needed

export default router;
