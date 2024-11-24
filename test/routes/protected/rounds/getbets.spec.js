// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import app from '../../../../app.js';

import {
  findAllBets,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findAllBets: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/round/getbets endpoints', () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('/protected/round/getbets - returns 200 if all is well', async () => {
    findAllBets.mockResolvedValue(true);

    const response = await axios.get(`${baseURL}/api/v2/protected/round/getbets`);
    expect(response.status).toBe(200);
  });

  it('/protected/round/getbets - returns 500 if aws call fails', async () => {
    try {
      findAllBets.mockRejectedValue();

      await axios.get(`${baseURL}/api/v2/protected/round/getbets`);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
