import express from 'express';
import dashboardRouter from './routes/index';

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Energy Monitoring API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/dashboard', dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'ERROR', message: `Route ${req.method} ${req.path} not found`, data: null });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[App] Unhandled error:', err);
  res.status(500).json({ status: 'ERROR', message: 'Internal server error', data: null });
});

export default app;
