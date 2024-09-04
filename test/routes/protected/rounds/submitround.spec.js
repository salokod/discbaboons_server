// tests/routes.test.js
import axios from 'axios';
import Chance from 'chance';

import http from 'http';
import { expect, describe, it } from '@jest/globals';
import app from '../../../../app.js';

import {
  updateRoundTransaction,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  updateRoundTransaction: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

const chance = new Chance();

describe('check the /protected/round/submitround endpoints', () => {
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

  it('/protected/round/submitround - returns 200 if all is well solo', async () => {
    const baboontype = `#round-${chance.guid()}`;
    const baboonid = chance.guid();
    const mockSoloNoBets = {
      baboontype,
      baboonid,
      otherBaboons: [],
    };

    const expectedPayload = [
      {
        Update: {
          ExpressionAttributeValues: {
            ':roundStatus': 'completed',
          },
          Key: {
            baboonid: 'mockedBaboonId',
            baboontype,
          },
          ReturnValues: 'ALL_NEW',
          TableName: 'DiscBaboonUserData',
          UpdateExpression: 'set roundStatus = :roundStatus',
        },
      },
    ];

    updateRoundTransaction.mockResolvedValue(true);

    const response = await axios.post(`${baseURL}/api/v2/protected/round/submitround`, mockSoloNoBets);
    expect(response.status).toBe(200);
    // expect updateRoundTransaction to be called with an array with 1 element
    expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(1);
    expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
  });

  it('/protected/round/submitround - returns 200 with random amount of baboons', async () => {
    function generateRandomBaboons() {
      const numberOfBaboons = chance.integer({ min: 1, max: 10 });
      const sideBetBaboons = Array.from({ length: numberOfBaboons }, () => ({
        baboonFriendUsername: chance.name(),
        baboonFriendId: chance.guid(),
      }));

      const gamesPlayedBet = [
        {
          results: sideBetBaboons.reduce((acc, baboon) => {
            acc[baboon.baboonFriendId] = chance.integer({ min: 0, max: 1 });
            acc[`${baboon.baboonFriendId}_money`] = chance.floating({ min: -20, max: 20 });
            return acc;
          }, {}),
          game: 'side',
          details: [
            {
              sideBetBaboons: sideBetBaboons.map((baboon) => ({
                baboonFriendId: baboon.baboonFriendId,
                baboonFriendUsername: baboon.baboonFriendUsername,
              })),
              sideBetAmount: chance.integer({ min: 1, max: 100 }),
              sideBetLabel: chance.word(),
              typeOfSideBet: 'hole',
              hole: chance.integer({ min: 1, max: 18 }),
              status: 'completed',
              winnerId: chance.guid(),
              winnerUsername: chance.name(),
            },
          ],
        },
        {
          results: sideBetBaboons.reduce((acc, baboon) => {
            acc[baboon.baboonFriendId] = chance.integer({ min: 0, max: 1 });
            acc[`${baboon.baboonFriendId}_money`] = chance.floating({ min: -20, max: 20 });
            return acc;
          }, {}),
          game: 'skins',
        },
      ];

      const payload = {
        otherBaboons_bet: sideBetBaboons,
        baboontype_bet: `#baboonbet-${chance.guid()}`,
        baboonid_bet: chance.guid(),
        gamesPlayed_bet: gamesPlayedBet,
        baboontype: `#round-${chance.guid()}`,
        baboonid: chance.guid(),
        otherBaboons: sideBetBaboons,
      };

      return payload;
    }

    const mockPayload = generateRandomBaboons();

    const expectedPayload = [
      {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid: 'mockedBaboonId',
            baboontype: mockPayload.baboontype,
          },
          UpdateExpression: 'set roundStatus = :roundStatus',
          ExpressionAttributeValues: { ':roundStatus': 'completed' },
          ReturnValues: 'ALL_NEW',
        },
      },
    ];

    mockPayload.otherBaboons.forEach((baboon) => {
      expectedPayload.push({
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid: baboon.baboonFriendId,
            baboontype: mockPayload.baboontype,
          },
          UpdateExpression: 'set roundStatus = :roundStatus',
          ExpressionAttributeValues: { ':roundStatus': 'completed' },
          ReturnValues: 'ALL_NEW',
        },
      });
    });

    try {
      updateRoundTransaction.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/round/submitround`, mockPayload);
      expect(response.status).toBe(200);
      expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(mockPayload.otherBaboons.length + 1);
      expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
    } catch (e) {
      expect(true).toBe(false);
    }
  });

  const generateValidPayload = () => ({
    baboontype: `#round-${chance.guid()}`,
    baboonid: chance.guid(),
    otherBaboons: [
      {
        baboonFriendUsername: chance.name(),
        baboonFriendId: chance.guid(),
      },
    ],
  });

  it('returns 400 if any required field is missing', async () => {
    const requiredFields = ['baboontype', 'baboonid'];

    // eslint-disable-next-line no-restricted-syntax
    for (const field of requiredFields) {
      const payload = generateValidPayload();
      delete payload[field];

      try {
        // eslint-disable-next-line no-await-in-loop
        await axios.post(`${baseURL}/api/v2/protected/round/submitround`, payload);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // console.log('error', error);
        expect(error.response.status).toBe(400);
      }
    }
  });

  it('returns 400 if any random field is in payload', async () => {
    const payload = {
      ...generateValidPayload(),
      [chance.word()]: chance.word(),
    };

    try {
      await axios.post(`${baseURL}/api/v2/protected/round/submitround`, payload);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('/protected/round/submitround - returns 500 if all is well solo', async () => {
    const baboontype = `#round-${chance.guid()}`;
    const baboonid = chance.guid();
    const mockSoloNoBets = {
      baboontype,
      baboonid,
      otherBaboons: [],
    };

    updateRoundTransaction.mockRejectedValue(true);

    try {
      await axios.post(`${baseURL}/api/v2/protected/round/submitround`, mockSoloNoBets);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }

    // expect updateRoundTransaction to be called with an array with 1 element
    // expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(1);
    // expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
  });
});
