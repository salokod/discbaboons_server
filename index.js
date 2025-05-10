import app from './src/app.js';

const port = process.env.PORT || 3000;

// Only start the server if this file is executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

// Export app for testing
export default app;
