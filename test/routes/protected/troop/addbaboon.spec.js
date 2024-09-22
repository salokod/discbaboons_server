// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import {
  findAllTroop,
  addBaboonTroopRequestsTransaction,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

import { findOneUserName } from '../../../../controllers/userDatabaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findAllTroop: jest.fn(() => true),
  addBaboonTroopRequestsTransaction: jest.fn(() => true),
}));

jest.mock('../../../../controllers/userDatabaseDynamo.js', () => ({
  findOneUserName: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

const chance = new Chance();

describe('check the /protected/troop/addbaboon endpoints', () => {
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

  it('/protected/troop/addbaboon - returns 400 if username is not in payload', async () => {
    try {
      // findOneUserName.mockResolvedValue({ Items: [] });
      const payload = {};

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/addbaboon - returns 404 if username does not exist', async () => {
    const payload = { username: chance.word() };
    try {
      findOneUserName.mockResolvedValue({ Items: [] });

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(404);
    }
  });

  it('/protected/troop/addbaboon - returns 403 if username is the requesting baboon', async () => {
    const usernameRandom = 'mockedBaboonId';
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(403);
    }
  });

  it('/protected/troop/addbaboon - returns 409 if username is already in baboon troop not denied', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      findAllTroop.mockResolvedValue({ Items: [{ baboonFriendId: usernameRandom, troopStatus: 'approved' }] });

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(409);
    }
  });

  it('/protected/troop/addbaboon - returns 200 if username is already in baboon troop but denied', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      findAllTroop.mockResolvedValue({ Items: [{ baboonFriendId: usernameRandom, troopStatus: 'denied' }] });
      addBaboonTroopRequestsTransaction.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/troop/addbaboon - returns 200 if username if all well and has not been requested yet', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      findAllTroop.mockResolvedValue({ Items: [] });
      addBaboonTroopRequestsTransaction.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/troop/addbaboon - returns 500 if findOneUserName aws call fails', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockRejectedValueOnce();
      findAllTroop.mockResolvedValue({ Items: [] });
      addBaboonTroopRequestsTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }
  });

  it('/protected/troop/addbaboon - returns 500 if findOneUserName aws call fails', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      findAllTroop.mockRejectedValue();
      addBaboonTroopRequestsTransaction.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }
  });

  it('/protected/troop/addbaboon - returns 500 if addBaboonTroopRequests aws call fails', async () => {
    const usernameRandom = chance.word();
    const payload = { username: usernameRandom };
    try {
      findOneUserName.mockResolvedValue({ Items: [{ id: usernameRandom }] });
      findAllTroop.mockResolvedValue({ Items: [] });
      addBaboonTroopRequestsTransaction.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/troop/addbaboon`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }
  });
});
