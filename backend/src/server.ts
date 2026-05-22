import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initWebSocket } from './services/websocket';
import assignmentRoutes from './routes/assignmentRoutes';
import submissionRoutes from './routes/submissionRoutes';
import groupRoutes from './routes/groupRoutes';
import libraryRoutes from './routes/libraryRoutes';
import toolkitRoutes from './routes/toolkitRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Load environment variables
dotenv.config();

// Environment Validation
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`[CRITICAL ERROR] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Server failed to start due to missing configuration. Exiting...');
  process.exit(1);
}

// Boot up BullMQ workers
import { initWorkers } from './workers/generationWorker';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Adjust to specific frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically so frontend can download files/PDFs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/toolkit', toolkitRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VedaAI Backend' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error Handler]:', err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize WebSockets
  initWebSocket(server);

  // Initialize background workers (BullMQ or in-memory fallback)
  await initWorkers();

  server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  VedaAI Server is running on port ${PORT} `);
    console.log(`  WebSocket events active.               `);
    console.log(`=========================================`);
  });
};

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
