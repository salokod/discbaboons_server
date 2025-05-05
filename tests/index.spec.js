// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, jest } from '@jest/globals';
import axios from 'axios';

describe('Express Server Initialization', () => {
  const TEST_PORT = 3000;
  const BASE_URL = `http://localhost:${TEST_PORT}`;

  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();
  });

  describe('Server connectivity', () => {
    it('should connect to a running server', async () => {
      try {
        // This will only pass if a server is actually running on port 3000
        const response = await axios.get(`${BASE_URL}/health`);
        expect(response.status).toBe(200);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          // Create a more readable error message
          throw new Error(
            '\n\n⚠️  SERVER NOT RUNNING ⚠️\n'
            + `Please start the server on port ${TEST_PORT} before running tests.\n`
            + 'Run this command in a separate terminal:\n\n'
            + 'node index.js\n\n',
          );
        }
        // If it's another type of error, just rethrow it
        throw error;
      }
    });

    it('should connect to the correct port', async () => {
      // Verify we're using the expected port by checking server response
      const response = await axios.get(`${BASE_URL}/health`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('hello world');
    });
  });
});
