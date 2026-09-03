import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import callRoutes from './routes/callRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import agoraRoutes from './routes/agoraRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import telephonyRoutes from './routes/telephonyRoutes.js';

const app = express();

// 1. CORS Configuration (Supports dynamic/custom frontend origins)
const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback allows local frontends
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id'],
  })
);

// 2. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cavi-backend', timestamp: new Date().toISOString() });
});

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/dialer', callRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/case', caseRoutes);
app.use('/api/agora', agoraRoutes);
app.use('/api/action', actionRoutes);
app.use('/api/telephony', telephonyRoutes);

// Direct contract aliases matching legacy paths for seamless compatibility
app.post('/api/generate-agora-token', (req, res, next) => {
  req.url = '/token';
  agoraRoutes(req, res, next);
});
app.post('/api/invite-agent', (req, res, next) => {
  req.url = '/invite-agent';
  agoraRoutes(req, res, next);
});
app.post('/api/analyze', (req, res, next) => {
  req.url = '/analyze';
  actionRoutes(req, res, next);
});

// 5. Error Handler
app.use(errorHandler);

export default app;
