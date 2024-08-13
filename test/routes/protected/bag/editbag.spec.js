// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';
import { updateBag } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  updateBag: jest.fn(),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/bag/editbag endpoints', () => {
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

  it('/protected/bag/editbag - returns 200 if all is well', async () => {
    try {
      const newBagJSON = {
        bagName: chance.animal(),
        isPrimary: false,
        bagId: chance.guid(),
        bagColor: chance.color({ format: 'hex' }),
      };
      updateBag.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/bag/editbag`, newBagJSON);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it('/protected/bag/editbag - returns 500 if aws call fails', async () => {
    try {
      const newBagJSON = {
        bagName: chance.animal(),
        isPrimary: false,
        bagId: chance.guid(),
        bagColor: chance.color({ format: 'hex' }),

      };
      updateBag.mockRejectedValue(false);

      await axios.post(`${baseURL}/api/v2/protected/bag/editbag`, newBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  const requiredFields = ['bagName', 'isPrimary', 'token', 'bagId'];
  requiredFields.forEach((field) => {
    it(`/protected/bag/editbag - returns 400 if ${field} is not in payload`, async () => {
      const newBagJSON = {
        bagName: chance.animal(),
        isPrimary: false,
        bagId: chance.guid(),
      };

      delete newBagJSON[field];

      try {
        updateBag.mockResolvedValue(true);

        await axios.post(`${baseURL}/api/v2/protected/bag/editbag`, newBagJSON);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
