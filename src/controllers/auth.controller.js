/**
 * Auth controller for handling authentication-related endpoints
 */

/**
 * Simple hello world response for the auth controller
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const helloWorld = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hello from Auth controller',
  });
};

// Export default controller object with all functions
export default {
  helloWorld,
};
