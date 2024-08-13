// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import { addToUserTable, deleteBagById } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  addToUserTable: jest.fn(() => true),
  deleteBagById: jest.fn(),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/deletebag endpoints', () => {
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

  it('/protected/bag/deletebag - returns 200 if all is well', async () => {
    try {
      const newBagJSON = {
        bagId: chance.guid(),
      };
      addToUserTable.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/bag/deletebag`, newBagJSON);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
  it('/protected/bag/deletebag - returns 400 if all if bagId is not in payload', async () => {
    try {
      const newBagJSON = {
      };
      // addToUserTable.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/bag/deletebag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/protected/bag/deletebag - returns 400 if all if random field is in payload', async () => {
    try {
      const newBagJSON = {
        bagId: chance.animal(),
        isPrimary: false,
      };
      // addToUserTable.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/bag/deletebag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
  it('/protected/bag/deletebag - returns 500 if all if aws call fails', async () => {
    try {
      const newBagJSON = {
        bagId: chance.animal(),
      };
      // addToUserTable.mockResolvedValue(true);
      deleteBagById.mockRejectedValue(new Error('AWS Failure'));

      await axios.post(`${baseURL}/api/v2/protected/bag/deletebag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
