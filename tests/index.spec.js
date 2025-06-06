import {
  describe, it, expect, beforeAll, afterAll,
} from '@jest/globals';
import axios from 'axios';
import app from '../index.js';
import config from '../config/index.js';

describe('Express App', () => {
  const PORT = config.port; // Use test port from config
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

  describe('GET /', () => {
    it('should return 200 status and correct message', async () => {
      const response = await axios.get(`${BASE_URL}/`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: 'OK',
        message: 'hello world',
      });
    });
  });

  describe('GET /health', () => {
    it('should return 200 status and health information', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        status: 'OK',
        message: 'hello world',
      });
    });
  });

  // Add tests for routes that don't exist
  describe('Non-existent routes', () => {
    it('should return 404 for unknown routes', async () => {
      try {
        await axios.get(`${BASE_URL}/nonexistent-route`);
        // If we get here, the request didn't fail as expected
        throw new Error('Expected request to fail with 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
