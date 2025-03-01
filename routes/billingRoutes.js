import express from 'express';
import {
    getAllBills,
    getBill,
    createBill,
    updateBill,
    deleteBill
} from '../controllers/billingController.js';

const router = express.Router();

router.get('/', getAllBills);
router.get('/:id', getBill);
router.post('/', createBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;
