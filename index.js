import express from 'express';

const port = 3000;

const app = express();

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'hello world',
  });
});

// Add health endpoint for testing
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'hello world',
  });
});

// Only start the server if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

// Export app for testing
export default app;
