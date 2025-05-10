import app from './src/app.js';
import logger from './utils/logger.js';
import config from './config/index.js';

const { port } = config;

let server;

// Handle graceful shutdown
function gracefulShutdown(signal) {
  return () => {
    logger.info(`${signal} received. Shutting down server...`);

    server.close(() => {
      logger.info('Server has been gracefully terminated');
      process.exit(0);
    });

    // Force shutdown after timeout if server doesn't close quickly
    setTimeout(() => {
      logger.error('Server shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);
  };
}

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Create server instance
  server = app.listen(port, () => {
    logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown('SIGTERM'));
  process.on('SIGINT', gracefulShutdown('SIGINT'));
}

// Export app for testing
export default app;
