// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import {
  expect, describe, it, beforeAll, afterAll,
} from '@jest/globals';
import Chance from 'chance';
import app from '../../../app';

const chance = new Chance();

jest.mock('../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => next()),
}));

describe('check the /protected/bag endpoints', () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('/protected/bag/addbag - returns 200 if token is correct', async () => {
    try {
      const response = await axios.post(`${baseURL}/api/v2/protected/bag/addbag`, { token: chance.hash() });
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });
});
