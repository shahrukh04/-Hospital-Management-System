import { Router } from 'express';
import {
    getAllStaff,
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff
} from '../controllers/staffController.js';  // ✅ Use .js extension for ESM

const router = Router();

router.get('/', getAllStaff);
router.get('/:id', getStaff);
router.post('/', addStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
