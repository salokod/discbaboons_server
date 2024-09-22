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

describe('check the /protected/round/updateround endpoints', () => {
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

  it('/protected/round/updateround - returns 200 if all is well, solo', async () => {
    const generateMockData = () => {
      const holeData = Array.from({ length: 18 }, (_, i) => ({
        par: chance.pickone(['3', '4', '5']),
        distance: chance.integer({ min: 100, max: 500 }).toString(),
        holeNumber: (i + 1).toString(),
        [chance.guid()]: chance.integer({ min: 0, max: 5 }),
      }));

      const scoreInfo = {
        roundPar: chance.integer({ min: 50, max: 70 }),
        [`${chance.guid()}_score`]: chance.integer({ min: 0, max: 5 }),
        [`${chance.guid()}_par`]: chance.integer({ min: 0, max: 5 }),
      };

      const baboontype = `#round-${chance.guid()}`;

      const otherBaboons = [];

      return {
        holeData, scoreInfo, baboontype, otherBaboons,
      };
    };

    const mockData = generateMockData();

    const expectedPayload = [{
      Update: {
        TableName: 'DiscBaboonUserData',
        Key: {
          baboonid: 'mockedBaboonId',
          baboontype: mockData.baboontype,
        },
        UpdateExpression: 'set holeData = :holeData, scoreInfo = :scoreInfo',
        ExpressionAttributeValues: {
          ':holeData': mockData.holeData,
          ':scoreInfo': mockData.scoreInfo,
        },
        ReturnValues: 'ALL_NEW',
      },
    }];

    updateRoundTransaction.mockResolvedValue(true);

    try {
      const response = await axios.post(`${baseURL}/api/v2/protected/round/updateround`, mockData);
      expect(response.status).toBe(200);
      // expect updateRoundTransaction to be called with an array with 1 element
      expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(1);
      expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('/protected/round/updateround - returns 500 if fail', async () => {
    const generateMockData = () => {
      const holeData = Array.from({ length: 18 }, (_, i) => ({
        par: chance.pickone(['3', '4', '5']),
        distance: chance.integer({ min: 100, max: 500 }).toString(),
        holeNumber: (i + 1).toString(),
        [chance.guid()]: chance.integer({ min: 0, max: 5 }),
      }));

      const scoreInfo = {
        roundPar: chance.integer({ min: 50, max: 70 }),
        [`${chance.guid()}_score`]: chance.integer({ min: 0, max: 5 }),
        [`${chance.guid()}_par`]: chance.integer({ min: 0, max: 5 }),
      };

      const baboontype = `#round-${chance.guid()}`;

      const otherBaboons = [];

      return {
        holeData, scoreInfo, baboontype, otherBaboons,
      };
    };

    const mockData = generateMockData();

    updateRoundTransaction.mockRejectedValue();

    try {
      await axios.post(`${baseURL}/api/v2/protected/round/updateround`, mockData);
      // // expect updateRoundTransaction to be called with an array with 1 element
      // expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(1);
      // expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }
  });

  it('/protected/round/updateround - returns 200 if all is well, with random amount of baboons', async () => {
    const generateMockData = () => {
      const otherBaboons = Array.from({ length: chance.integer({ min: 1, max: 10 }) }, () => ({
        baboonFriendUsername: chance.name(),
        baboonFriendId: chance.guid(),
      }));

      const holeData = Array.from({ length: 18 }, (_, i) => {
        const hole = {
          par: chance.pickone(['3', '4', '5']),
          distance: chance.integer({ min: 100, max: 500 }).toString(),
          holeNumber: (i + 1).toString(),
        };
        otherBaboons.forEach((baboon) => {
          hole[baboon.baboonFriendId] = chance.integer({ min: 0, max: 5 });
        });
        return hole;
      });

      const scoreInfo = {
        roundPar: chance.integer({ min: 50, max: 70 }),
      };
      otherBaboons.forEach((baboon) => {
        scoreInfo[`${baboon.baboonFriendId}_score`] = chance.integer({ min: 0, max: 5 });
        scoreInfo[`${baboon.baboonFriendId}_par`] = chance.integer({ min: 0, max: 5 });
      });

      return {
        holeData,
        scoreInfo,
        baboontype: `#round-${chance.guid()}`,
        otherBaboons,
      };
    };

    const mockData = generateMockData();

    const expectedPayload = [];

    // adding main baboon
    expectedPayload.push(
      {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid: 'mockedBaboonId',
            baboontype: mockData.baboontype,
          },
          UpdateExpression: 'set holeData = :holeData, scoreInfo = :scoreInfo',
          ExpressionAttributeValues: {
            ':holeData': mockData.holeData,
            ':scoreInfo': mockData.scoreInfo,
          },
          ReturnValues: 'ALL_NEW',
        },
      },
    );

    // adding other baboons
    mockData.otherBaboons.forEach((baboon) => {
      expectedPayload.push({
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid: baboon.baboonFriendId,
            baboontype: mockData.baboontype,
          },
          UpdateExpression: 'set holeData = :holeData, scoreInfo = :scoreInfo',
          ExpressionAttributeValues: {
            ':holeData': mockData.holeData,
            ':scoreInfo': mockData.scoreInfo,
          },
          ReturnValues: 'ALL_NEW',
        },
      });
    });

    updateRoundTransaction.mockResolvedValue(true);

    try {
      const response = await axios.post(`${baseURL}/api/v2/protected/round/updateround`, mockData);
      expect(response.status).toBe(200);
      // expect updateRoundTransaction to be called with an array with 1 element
      expect(updateRoundTransaction.mock.calls[0][0].length).toEqual(mockData.otherBaboons.length + 1);
      expect(updateRoundTransaction).toHaveBeenCalledWith(expectedPayload);
    } catch {
      expect(true).toBe(false);
    }
  });

  const generateMockDataForTest = () => {
    const otherBaboons = Array.from({ length: chance.integer({ min: 1, max: 10 }) }, () => ({
      baboonFriendUsername: chance.name(),
      baboonFriendId: chance.guid(),
    }));

    const holeData = Array.from({ length: 18 }, (_, i) => {
      const hole = {
        par: chance.pickone(['3', '4', '5']),
        distance: chance.integer({ min: 100, max: 500 }).toString(),
        holeNumber: (i + 1).toString(),
      };
      otherBaboons.forEach((baboon) => {
        hole[baboon.baboonFriendId] = chance.integer({ min: 0, max: 5 });
      });
      return hole;
    });

    const scoreInfo = {
      roundPar: chance.integer({ min: 50, max: 70 }),
    };
    otherBaboons.forEach((baboon) => {
      scoreInfo[`${baboon.baboonFriendId}_score`] = chance.integer({ min: 0, max: 5 });
      scoreInfo[`${baboon.baboonFriendId}_par`] = chance.integer({ min: 0, max: 5 });
    });

    return {
      holeData,
      scoreInfo,
      baboontype: `#round-${chance.guid()}`,
      otherBaboons,
    };
  };

  const requiredFields = ['baboontype', 'holeData', 'otherBaboons', 'scoreInfo'];

  requiredFields.forEach((field) => {
    it(`/protected/round/updateround - should return 400 if ${field} is missing`, async () => {
      const mockData = generateMockDataForTest();
      delete mockData[field];

      try {
        await axios.post(`${baseURL}/api/v2/protected/round/updateround`, mockData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain(field);
      }
    });
  });
});
