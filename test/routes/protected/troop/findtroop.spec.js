// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import app from '../../../../app.js';

import {
  findAllTroop,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findAllTroop: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/troop/findtroop endpoints', () => {
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

  it('/protected/troop/findtroop - returns 200 if all is well', async () => {
    findAllTroop.mockResolvedValue(true);

    const response = await axios.get(`${baseURL}/api/v2/protected/troop/findtroop`);
    expect(response.status).toBe(200);
  });

  it('/protected/troop/findtroop - returns 500 if aws call fails', async () => {
    try {
      findAllTroop.mockRejectedValue();

      await axios.get(`${baseURL}/api/v2/protected/troop/findtroop`);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
