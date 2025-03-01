import express from 'express';
import {
    getAllLabTests,
    getLabTest,
    orderLabTest,           // ✅ Corrected from addLabTest
    updateLabTestStatus     // ✅ Corrected from updateLabTest
} from '../controllers/labController.js';   // Use ESM import with `.js`

import LabTest from '../models/LabTest.js';   // Import the LabTest model with ESM

const router = express.Router();

router.get('/', getAllLabTests);
router.get('/:id', getLabTest);
router.post('/', orderLabTest);          // ✅ Corrected
router.put('/:id', updateLabTestStatus);  // ✅ Corrected

// DELETE route for removing a lab test
router.delete('/:id', async (req, res) => {
    try {
        const result = await LabTest.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Lab test not found' });
        }
        res.json({ message: 'Lab test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lab test', error: error.message });
    }
});

export default router;  // ✅ Use `export default` for ESM
