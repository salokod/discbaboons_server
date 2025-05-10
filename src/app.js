import express from 'express';
import pinoHttp from 'pino-http';
import routes from './routes/index.js';
import logger from '../utils/logger.js';

const app = express();

// Add pino-http middleware for request logging
app.use(pinoHttp({
  logger,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'hello world',
  });
});

// Health check endpoint - needed for your tests
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'hello world',
  });
});

// Mount API routes
app.use('/', routes);

// Export the app for testing and for use in the server
export default app;
