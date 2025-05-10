import express from 'express';
import routes from './routes/index.js';

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'hello worldssss',
  });
});

// Health check endpoint - needed for your tests
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OKs',
    message: 'hello world',
  });
});

// Mount API routes
app.use('/', routes);

// Export the app for testing and for use in the server
export default app;
