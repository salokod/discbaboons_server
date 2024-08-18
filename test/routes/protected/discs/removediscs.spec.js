// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import { deleteDiscsTransaction } from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  deleteDiscsTransaction: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/disc/removedisc endpoints', () => {
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

  it('/protected/disc/removediscs - returns 200 if all is well', async () => {
    try {
      const removeDiscJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        transitionedDiscs: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
      };

      deleteDiscsTransaction.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/disc/removediscs`, removeDiscJSON);
      expect(response.status).toBe(200);
    } catch (error) {
      expect(true).toBe(false);
    }
  });
  it('/protected/disc/removediscs - returns 400 any object in array is missing baboontype', async () => {
    try {
      const removeDiscJSON = {
        transitionedDiscs: [
          ...Array.from({ length: chance.d20() - 1 }, () => ({
            baboontype: chance.guid(),
          })),
          {}, // Object without baboontype field
        ],
      };
      deleteDiscsTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/removediscs`, removeDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/protected/disc/removediscs - returns 500 aws delete transaction fails', async () => {
    try {
      const removeDiscJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        transitionedDiscs: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
      };
      deleteDiscsTransaction.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/disc/removediscs`, removeDiscJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
