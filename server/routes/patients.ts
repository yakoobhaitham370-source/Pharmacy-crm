import express from 'express';
import { getPatients, getPatientById, createPatient, updatePatient } from '../controllers/patientsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

export default router;
