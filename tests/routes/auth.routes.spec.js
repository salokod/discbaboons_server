import {
  describe, it, expect, beforeAll, afterAll,
} from '@jest/globals';
import axios from 'axios';
import app from '../../index.js';

describe('Auth Routes', () => {
  const PORT = 3002; // Use different port than other tests
  const BASE_URL = `http://localhost:${PORT}`;
  let server;

  // Start server before tests
  beforeAll(() => new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  }));

  // Close server after all tests
  afterAll(() => new Promise((resolve) => {
    server.close(resolve);
  }));

  describe('GET /auth/helloworld', () => {
    it('should return 200 status and greeting message', async () => {
      const response = await axios.get(`${BASE_URL}/auth/helloworld`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: 'OK',
        message: 'Hello from Auth controller',
      });
    });
  });
});
