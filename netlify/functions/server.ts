import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../../server/routes/auth.js';
import patientsRoutes from '../../server/routes/patients.js';
import medicationsRoutes from '../../server/routes/medications.js';
import refillsRoutes from '../../server/routes/refills.js';
import messagesRoutes from '../../server/routes/messages.js';
import drugsRoutes from '../../server/routes/drugs.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientsRoutes);
apiRouter.use('/medications', medicationsRoutes);
apiRouter.use('/refills', refillsRoutes);
apiRouter.use('/messages', messagesRoutes);
apiRouter.use('/drugs', drugsRoutes);

app.use('/api', apiRouter);

export const handler = serverless(app);
