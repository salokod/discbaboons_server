// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import {
  findOneTroopRequest,
  updateTroopReq,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findOneTroopRequest: jest.fn(() => true),
  updateTroopReq: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

const chance = new Chance();

describe('check the /protected/troop/troopchoice endpoints', () => {
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

  it('/protected/troop/troopchoice - returns 400 if payload does not have baboonReq in appropriate format', async () => {
    const payload = {
      baboonReq: 'invalid',
      choice: 'approved',
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/troopchoice - returns 400 if payload does not have baboonReq in payload', async () => {
    const payload = {
      choice: 'approved',
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/troopchoice - returns 400 if choice is not approved or denied', async () => {
    const payload = {
      baboonReq: `#troopreq-${chance.guid()}`,
      choice: chance.word(),
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/troopchoice - returns 400 if choice is not in payload', async () => {
    const payload = {
      baboonReq: `#troopreq-${chance.guid()}`,
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/troopchoice - returns 400 if random field is in payload', async () => {
    const randomFieldName = chance.string({ length: 10, pool: 'abcdefghijklmnopqrstuvwxyz' });

    const payload = {
      baboonReq: `#troopreq-${chance.guid()}`,
      choice: 'approved',
      [randomFieldName]: chance.word(),
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(400);
    }
  });

  it('/protected/troop/troopchoice - returns 404 if troop request doesnt exist', async () => {
    const payload = {
      baboonReq: `#troopreq-${chance.guid()}`,
      choice: 'approved',
    };

    findOneTroopRequest.mockResolvedValue({ Items: [] });

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(404);
    }
  });

  it('/protected/troop/troopchoice - returns 409 if request already exists in pending', async () => {
    const baboonReq = `#troopreq-${chance.guid()}`;
    const payload = {
      baboonReq,
      choice: 'approved',
    };

    const troopRequest = {
      troopStatus: 'pending',
      baboontype: baboonReq,
      baboonFriendUsername: 'salokod',
      baboonid: 'mockedBaboonId',
      dateReviewed: '2024-08-17',
      dateOfRequest: '2024-08-17',
      baboonFriendId: '55723813-50bb-4f5b-93ed-7a03ca4d59fa',
    };

    findOneTroopRequest.mockResolvedValue({ Items: [troopRequest] });

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(409);
    }
  });

  it('/protected/troop/troopchoice - returns 200 if request is formed correctly', async () => {
    const baboonReq = `#troopreq-${chance.guid()}`;
    const payload = {
      baboonReq,
      choice: 'approved',
    };

    const troopRequest = {
      troopStatus: 'requested',
      baboontype: baboonReq,
      baboonFriendUsername: 'salokod',
      baboonid: 'mockedBaboonId',
      dateReviewed: '2024-08-17',
      dateOfRequest: '2024-08-17',
      baboonFriendId: '55723813-50bb-4f5b-93ed-7a03ca4d59fa',
    };

    findOneTroopRequest.mockResolvedValue({ Items: [troopRequest] });
    updateTroopReq.mockResolvedValue(true);

    try {
      const response = await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(response.status).toBe(200);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/troop/troopchoice - returns 500 if error happens while calling AWS', async () => {
    const baboonReq = `#troopreq-${chance.guid()}`;
    const payload = {
      baboonReq,
      choice: 'approved',
    };

    findOneTroopRequest.mockRejectedValue(false);
    updateTroopReq.mockResolvedValue(true);

    try {
      await axios.post(`${baseURL}/api/v2/protected/troop/troopchoice`, payload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }
  });
});
