import express from 'express';
import { getDrugs, createDrug, updateDrug } from '../controllers/drugsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDrugs);
router.post('/', createDrug);
router.put('/:id', updateDrug);

export default router;
