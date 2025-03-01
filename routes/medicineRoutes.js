import express from "express";
import {
    searchMedicines,
    getMedicinesByCategory,
    getLowStockMedicines,
    getExpiringSoonMedicines,
    getMedicineStats,
    getAllMedicines,
    getMedicineById,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineCount
} from "../controllers/medicineController.js";

const router = express.Router();

router.get('/search', searchMedicines);
router.get('/category/:category', getMedicinesByCategory);
router.get('/low-stock', getLowStockMedicines);
router.get('/expiring-soon', getExpiringSoonMedicines);
router.get('/stats', getMedicineStats);

// ✅ Place `/count` BEFORE `/:id`
router.get('/count', getMedicineCount);

// ✅ Dynamic `/:id` should always be last
router.get('/:id', getMedicineById);

router.get('/', getAllMedicines);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
