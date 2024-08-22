// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import app from '../../../../app.js';

import {
  deleteRoundById,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  deleteRoundById: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

const chance = new Chance();

describe('check the /protected/round/deleteround endpoints', () => {
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

  it('/protected/round/deleteround - returns 200 if all is well', async () => {
    const deleteRoundJSON = {
      roundId: chance.guid(),
    };

    deleteRoundById.mockResolvedValue(true);

    const response = await axios.post(`${baseURL}/api/v2/protected/round/deleteround`, deleteRoundJSON);
    expect(deleteRoundById).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('/protected/round/deleteround - returns 500 if all is well', async () => {
    try {
      const deleteRoundJSON = {
        roundId: chance.guid(),
      };

      deleteRoundById.mockRejectedValue(false);

      await axios.post(`${baseURL}/api/v2/protected/round/deleteround`, deleteRoundJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  it('/protected/round/deleteround - returns 400 if roundId is not provided', async () => {
    try {
      await axios.post(`${baseURL}/api/v2/protected/round/deleteround`, {});
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  // test to see if something else is in body with roundId, 400 error
  it('/protected/round/deleteround - returns 400 if roundId is not the only item in payload', async () => {
    try {
      const randomVariablePayload = { roundId: chance.guid(), [chance.word()]: chance.guid() };
      await axios.post(`${baseURL}/api/v2/protected/round/deleteround`, randomVariablePayload);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});
