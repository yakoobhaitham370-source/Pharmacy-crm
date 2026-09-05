import express from 'express';
import { getMessages, recordMessageAction } from '../controllers/messagesController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMessages);
router.post('/action', recordMessageAction);

export default router;
