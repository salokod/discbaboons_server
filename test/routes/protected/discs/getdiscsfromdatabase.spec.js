// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import app from '../../../../app.js';

import { getAllDiscs } from '../../../../controllers/discTableDynamo.js';

jest.mock('../../../../controllers/discTableDynamo.js', () => ({
  getAllDiscs: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/disc/findalldiscs endpoints', () => {
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

  it('/protected/disc/getdiscsfromdatabase - returns 200 if all is well', async () => {
    try {
      getAllDiscs.mockResolvedValue({ Items: [{ id: 1 }] });
      const response = await axios.get(`${baseURL}/api/v2/protected/disc/getdiscsfromdatabase`);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/disc/getdiscsfromdatabase - returns 500 if disc call fails', async () => {
    try {
      getAllDiscs.mockRejectedValue();
      await axios.get(`${baseURL}/api/v2/protected/disc/getdiscsfromdatabase`);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
