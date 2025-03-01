import express from 'express';
import {
    createBed,
    getAllBeds,
    getBedById,
    updateBed,
    deleteBed,
    getTotalBeds,
    getOccupiedBeds,
    getBedOccupancyStats,
    getMonthlyBedStats
} from '../controllers/BedController.js';

const router = express.Router();

// CRUD routes
router.post('/', createBed);           // Create Bed
router.get('/', getAllBeds);            // Get All Beds
router.get('/:id', getBedById);         // Get Single Bed
router.put('/:id', updateBed);          // Update Bed
router.delete('/:id', deleteBed);       // Delete Bed

// Stats routes
router.get('/stats/total', getTotalBeds);                // Total Beds Count
router.get('/stats/occupied', getOccupiedBeds);          // Occupied Beds Count
router.get('/stats/occupancy', getBedOccupancyStats);    // Occupancy Stats per Department
router.get('/stats/monthly', getMonthlyBedStats);        // Monthly Bed Stats (optional)

export default router;
