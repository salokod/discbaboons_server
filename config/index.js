// Configuration settings for different environments
const environments = {
  development: {
    port: 3000,
    logLevel: 'info',
  },
  test: {
    port: 3001,
    logLevel: 'warn',
  },
  production: {
    port: process.env.PORT || 3000,
    logLevel: 'info',
  },
};

// Default to development if NODE_ENV is not set
const env = process.env.NODE_ENV || 'development';
const config = environments[env] || environments.development;

export default config;
