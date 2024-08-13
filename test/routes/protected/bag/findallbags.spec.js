// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';
import { findAllBags } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findAllBags: jest.fn(),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/bag/findallbags endpoints', () => {
  let server;
  let baseURL;

  const chance = new Chance();

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
    baseURL = `http://localhost:${server.address().port}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('/protected/bag/findallbags - returns 200 if all is well', async () => {
    try {
      const testPayload = {
        Count: 1,
        Items: [{
          isPrimary: true,
          baboonid: chance.guid(),
          bagName: chance.string(),
          baboontype: chance.guid(),
          bagColor: chance.color({ format: 'hex' }),
        }],
      };
      findAllBags.mockResolvedValue(testPayload);

      const response = await axios.get(`${baseURL}/api/v2/protected/bag/findallbags`);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
  it('/protected/bag/findallbags - returns 200 if all is well, and bag is empty', async () => {
    try {
      const testPayload = {
        Count: 1,
        Items: [],
      };
      findAllBags.mockResolvedValue(testPayload);

      const response = await axios.get(`${baseURL}/api/v2/protected/bag/findallbags`);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it('/protected/bag/findallbags - returns 500 if aws call fails', async () => {
    try {
      findAllBags.mockRejectedValue(false);

      await axios.get(`${baseURL}/api/v2/protected/bag/findallbags`);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
