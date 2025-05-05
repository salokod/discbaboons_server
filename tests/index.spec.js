import {
  describe, it, expect, beforeAll, afterAll,
} from '@jest/globals';
import axios from 'axios';
import app from '../index.js';

describe('Express App', () => {
  const PORT = 3001; // Use different port than the main app
  const BASE_URL = `http://localhost:${PORT}`;
  let server;

  // Start server before tests
  beforeAll((done) => {
    server = app.listen(PORT, () => done());
  });

  // Close server after tests
  afterAll((done) => {
    server.close(done);
  });

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
