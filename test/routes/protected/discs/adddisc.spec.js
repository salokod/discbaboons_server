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

describe('check the /protected/disc/adddiscs endpoints', () => {
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

  it('/protected/disc/adddisc - returns 200 if all is well', async () => {
    try {
      const newDiscJSON = {
        brand: chance.company(),
        disc: chance.word(),
        bagId: chance.guid(),
        speed: chance.integer({ min: 1, max: 14 }),
        glide: chance.integer({ min: 1, max: 7 }),
        turn: chance.integer({ min: -5, max: 1 }),
        fade: chance.integer({ min: 0, max: 5 }),
        discColor: chance.color({ format: 'hex' }),
        dateOfPurchase: chance.date({ string: true }),
        discType: chance.string({ length: 5 }),
        discPlastic: chance.string({ length: 5 }),
        weight: chance.string({ length: 3 }),
      };
      addToUserTable.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/disc/adddisc`, newDiscJSON);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
  it('/protected/disc/adddisc - returns 500 if error writing to aws', async () => {
    try {
      const newDiscJSON = {
        brand: chance.company(),
        disc: chance.word(),
        bagId: chance.guid(),
        speed: chance.integer({ min: 1, max: 14 }),
        glide: chance.integer({ min: 1, max: 7 }),
        turn: chance.integer({ min: -5, max: 1 }),
        fade: chance.integer({ min: 0, max: 5 }),
        discColor: chance.color({ format: 'hex' }),
        dateOfPurchase: chance.date({ string: true }),
        discType: chance.string({ length: 5 }),
        discPlastic: chance.string({ length: 5 }),
        weight: chance.string({ length: 3 }),
      };
      addToUserTable.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/disc/adddisc`, newDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  // array of required fields
  const requiredFields = ['brand', 'disc', 'bagId', 'speed', 'glide', 'turn', 'fade', 'discColor', 'dateOfPurchase'];
  requiredFields.forEach((field) => {
    it(`/protected/disc/addbag - returns 400 if ${field} is not in payload`, async () => {
      const addDiscJSON = {
        brand: chance.company(),
        disc: chance.word(),
        bagId: chance.guid(),
        speed: chance.integer({ min: 1, max: 14 }),
        glide: chance.integer({ min: 1, max: 7 }),
        turn: chance.integer({ min: -5, max: 1 }),
        fade: chance.integer({ min: 0, max: 5 }),
        discColor: chance.color({ format: 'hex' }),
        dateOfPurchase: chance.date({ string: true }),
        discType: chance.string({ length: 5 }),
        discPlastic: chance.string({ length: 5 }),
        weight: chance.string({ length: 3 }),
      };

      delete addDiscJSON[field];

      try {
        addToUserTable.mockResolvedValue(true);

        await axios.post(`${baseURL}/api/v2/protected/disc/adddisc`, addDiscJSON);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
