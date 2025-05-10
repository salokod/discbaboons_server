import express from 'express';

const app = express();

// Health check endpoint - needed for your tests
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'hello world',
  });
});

// Export the app for testing and for use in the server
export default app;
