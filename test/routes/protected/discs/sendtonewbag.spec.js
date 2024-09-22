// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';
import {
  findOneBag,
  sendDiscToNewBagTransaction,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findOneBag: jest.fn(() => true),
  sendDiscToNewBagTransaction: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

describe('check the /protected/disc/sendtonewbagendpoints', () => {
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

  it('/protected/disc/sendtonewbag - returns 200 if all is well', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
        newBagId: chance.guid(),
      };

      findOneBag.mockResolvedValue({ Items: [{ baboontype: sendToNewBagJSON.newBagId }] });

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/disc/sendtonewbag - returns 404 if bag is not found', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
        newBagId: chance.guid(),
      };

      findOneBag.mockResolvedValue({ Items: [] });

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it('/protected/disc/sendtonewbag - returns 500 aws findOneBag call fails', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
        newBagId: chance.guid(),
      };

      findOneBag.mockRejectedValue();

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  it('/protected/disc/sendtonewbag - returns 500 aws sendDiscToNewBagTransaction call fails', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
        newBagId: chance.guid(),
      };

      findOneBag.mockResolvedValue({ Items: [{ baboontype: sendToNewBagJSON.newBagId }] });

      sendDiscToNewBagTransaction.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  it('/protected/disc/sendtonewbag - returns 400 aws if newBagId not included in payload', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          baboontype: chance.guid(),
        })),
      };

      findOneBag.mockResolvedValue({ Items: [{ baboontype: sendToNewBagJSON.newBagId }] });

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/protected/disc/sendtonewbag - returns 400 aws if discsToMove not included in payload', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        newBagId: chance.guid(),
      };

      findOneBag.mockResolvedValue({ Items: [{ baboontype: sendToNewBagJSON.newBagId }] });

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/protected/disc/sendtonewbag - returns 400 aws if discsToMove not have good payload', async () => {
    try {
      const sendToNewBagJSON = { // create a transferredDiscs array of objects of random length with an object with baboontype as a string
        discsToMove: Array.from({ length: chance.d20() }, () => ({
          notBaboonType: chance.guid(),
        })),
        newBagId: chance.guid(),
      };

      findOneBag.mockResolvedValue({ Items: [{ baboontype: sendToNewBagJSON.newBagId }] });

      sendDiscToNewBagTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/disc/sendtonewbag`, sendToNewBagJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
