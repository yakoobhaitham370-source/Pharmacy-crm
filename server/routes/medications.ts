import express from 'express';
import { getMedications, createMedication, updateMedication } from '../controllers/medicationsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMedications);
router.post('/', createMedication);
router.put('/:id', updateMedication);

export default router;
