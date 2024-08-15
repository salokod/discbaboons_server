// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import { addToUserTable, findOneBag } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  addToUserTable: jest.fn(() => true),
  findOneBag: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/disc/editdisc endpoints', () => {
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
        baboontype: chance.guid(),
      };
      addToUserTable.mockResolvedValue(true);
      findOneBag.mockResolvedValue({ Items: [{ bagId: newDiscJSON.bagId }] });

      const response = await axios.post(`${baseURL}/api/v2/protected/disc/editdisc`, newDiscJSON);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });

  it('/protected/disc/adddisc - returns 404 if bag does not exist', async () => {
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
        baboontype: chance.guid(),
      };
      addToUserTable.mockResolvedValue(true);
      findOneBag.mockResolvedValue({ Items: [] });

      await axios.post(`${baseURL}/api/v2/protected/disc/editdisc`, newDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
  it('/protected/disc/adddisc - returns 500 if bag call fails', async () => {
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
        baboontype: chance.guid(),
      };
      addToUserTable.mockResolvedValue(true);
      findOneBag.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/disc/editdisc`, newDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  it('/protected/disc/editdisc - returns 500 if error writing to aws', async () => {
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
        baboontype: chance.guid(),
      };
      addToUserTable.mockRejectedValue();
      findOneBag.mockResolvedValue({ Items: [{ bagId: newDiscJSON.bagId }] });

      await axios.post(`${baseURL}/api/v2/protected/disc/editdisc`, newDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  // array of required fields
  const requiredFields = ['brand', 'disc', 'bagId', 'speed', 'glide', 'turn', 'fade', 'discColor', 'dateOfPurchase', 'baboontype'];
  requiredFields.forEach((field) => {
    it(`/protected/disc/editdisc - returns 400 if ${field} is not in payload`, async () => {
      const editDiscJSON = {
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
        baboontype: chance.guid(),
      };

      delete editDiscJSON[field];

      try {
        addToUserTable.mockResolvedValue(true);

        await axios.post(`${baseURL}/api/v2/protected/disc/editdisc`, editDiscJSON);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
