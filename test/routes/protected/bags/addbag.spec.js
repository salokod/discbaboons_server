// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import { addToUserTable } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  addToUserTable: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/addbag endpoints', () => {
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

  it('/protected/bag/addbag - returns 200 if all is well', async () => {
    try {
      const newBagJSON = {
        bagName: chance.animal(),
        bagColor: chance.color({ format: 'hex' }),
        isPrimary: false,
      };
      addToUserTable.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/bag/addbag`, newBagJSON);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });
  it('/protected/bag/addbag - returns 400 if all if bagName is not in payload', async () => {
    try {
      const newBagJSON = {
        bagColor: '#FFFFFF',
        isPrimary: false,
        token: chance.string(),
      };
      // addToUserTable.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/bag/addbag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/protected/bag/addbag - returns 400 if all if bagColor is not in payload', async () => {
    try {
      const newBagJSON = {
        bagName: chance.animal(),
        isPrimary: false,
        token: chance.string(),
      };
      // addToUserTable.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/bag/addbag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/protected/bag/addbag - returns 400 if all if bagColor is not in hex code format payload', async () => {
    try {
      const newBagJSON = {
        bagName: chance.animal(),
        isPrimary: false,
        token: chance.string(),
        bagColor: chance.states(),
      };
      // addToUserTable.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/bag/addbag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
