import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

// Routes
import authRoutes from './server/routes/auth.js';
import patientsRoutes from './server/routes/patients.js';
import medicationsRoutes from './server/routes/medications.js';
import refillsRoutes from './server/routes/refills.js';
import messagesRoutes from './server/routes/messages.js';
import drugsRoutes from './server/routes/drugs.js';
// import reportsRoutes from './server/routes/reports.js';
// import usersRoutes from './server/routes/users.js';
// import settingsRoutes from './server/routes/settings.js';
// import auditRoutes from './server/routes/audit.js';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  const apiRouter = express.Router();
  
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/patients', patientsRoutes);
  apiRouter.use('/medications', medicationsRoutes);
  apiRouter.use('/refills', refillsRoutes);
  apiRouter.use('/messages', messagesRoutes);
  apiRouter.use('/drugs', drugsRoutes);
  // apiRouter.use('/reports', reportsRoutes);
  // apiRouter.use('/users', usersRoutes);
  // apiRouter.use('/settings', settingsRoutes);
  // apiRouter.use('/audit', auditRoutes);

  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
