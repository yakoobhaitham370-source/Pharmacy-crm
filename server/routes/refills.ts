import express from 'express';
import { getRefills, recordRefill } from '../controllers/refillsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getRefills);
router.post('/', recordRefill);

export default router;
