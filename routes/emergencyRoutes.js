import { Router } from 'express';
import {
    getAllEmergencies,
    getEmergency,
    addEmergency,
    updateEmergency,
    deleteEmergency,
    getEmergencyCount,
    getEmergencyAlerts
} from '../controllers/emergencyController.js';

const router = Router();

router.get('/', getAllEmergencies);

// ✅ Place these specific routes BEFORE the `/:id` route
router.get('/count', getEmergencyCount);
router.get('/alerts', getEmergencyAlerts);

// ✅ Generic `/:id` route should always come LAST
router.get('/:id', getEmergency);
router.post('/', addEmergency);
router.put('/:id', updateEmergency);
router.delete('/:id', deleteEmergency);

export default router;
