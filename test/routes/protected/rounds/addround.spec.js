// tests/routes.test.js
import axios from 'axios';
import http from 'http';
import { expect, describe, it } from '@jest/globals';
import Chance from 'chance';
import { v4 as uuidv4 } from 'uuid';
import app from '../../../../app.js';

import {
  findAllTroop,
  addRoundTransactions,
} from '../../../../controllers/discBaboonUserDataBaseDynamo.js';

import { getOneCourse } from '../../../../controllers/courseTableDynamo.js';

jest.mock('../../../../controllers/discBaboonUserDataBaseDynamo.js', () => ({
  findAllTroop: jest.fn(() => true),
  addRoundTransactions: jest.fn(() => true),
}));

jest.mock('../../../../controllers/courseTableDynamo.js', () => ({
  getOneCourse: jest.fn(() => true),
}));

jest.mock('../../../../middleware/auth.js', () => ({
  isAuthenticated: jest.fn((req, res, next) => {
    req.jwt = { id: 'mockedBaboonId' };
    next();
  }),
}));

const chance = new Chance();

chance.mixin({
  uuidv4: () => uuidv4(),
});

const generateMockCourseJSON = () => {
  const numHoles = chance.integer({ min: 9, max: 18 });
  const holeData = Array.from({ length: numHoles }, (_, index) => ({
    distance: chance.integer({ min: 100, max: 500 }).toString(),
    holeNumber: (index + 1).toString(),
    par: chance.integer({ min: 3, max: 5 }).toString(),
  }));

  return {
    stateAbbr: chance.state({ full: false }),
    city_uuid: chance.guid(),
    city: chance.city(),
    holeData,
    numHoles,
    parkName: chance.word(),
  };
};

const generateMockBaboons = () => {
  const numBaboons = chance.d20();
  const baboons = [];
  for (let i = 0; i < numBaboons; i += 1) {
    baboons.push({
      baboonFriendId: chance.uuidv4(),
      baboonFriendUsername: chance.word(),
      registered: chance.bool(),
    });
  }
  return baboons;
};

const generateMockBets = () => {
  const numBets = chance.integer({ min: 1, max: 3 });
  const bets = [];
  for (let i = 0; i < numBets; i += 1) {
    bets.push({
      betType: chance.pickone(['side', 'skins']),
      label: chance.word(),
    });
  }
  return {
    games: bets,
    skinsAmount: chance.integer({ min: 0, max: 10 }),
  };
};

const generateMockPayload = (withBaboons = false, withBets = false) => ({
  state: chance.state({ full: false }),
  city_uuid: chance.guid(),
  roundName: chance.word(),
   
  chosenBaboons: withBaboons ? generateMockBaboons() : [],
  chosenBets: withBets ? generateMockBets() : { games: [], skinsAmount: 0 },
  totalWinLoss: chance.integer({ min: -100, max: 100 }),
});

describe('check the /protected/round/addround endpoints', () => {
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

  it('/protected/round/addround - returns 200 if all is well with baboons without bets', async () => {
    try {
      const addRoundJSON = generateMockPayload(true, false);
      const findTroopResponse = addRoundJSON.chosenBaboons
        .filter((baboon) => baboon.registered === true)
        .map((baboon) => ({
          ...baboon,
          troopStatus: 'approved',
        }));

      getOneCourse.mockResolvedValue({
        Items: [generateMockCourseJSON()],
      });
      findAllTroop.mockResolvedValue({ Items: findTroopResponse });
      addRoundTransactions.mockResolvedValue(true);

      const expectedRoundTransactions = addRoundJSON.chosenBets.games.length === 0 ? findTroopResponse.length + 1 : findTroopResponse.length * 2 + 2;

      const response = await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);

      const betOnlyTransactions = addRoundTransactions.mock.calls[0][0].filter((item) => item.Put.Item.baboontype.includes('bet'));

      // checks to be sure the baboons are added to the holeData, even the ones that are not registered
      addRoundTransactions.mock.calls[0][0][0].Put.Item.holeData.forEach((hole) => {
        addRoundJSON.chosenBaboons.forEach((baboon) => {
          expect(hole).toHaveProperty(baboon.baboonFriendId);
        });
      });

      // addRoundTransactions.mock.calls[0][0][0].Put.Item.holeData
      expect(response.status).toBe(200);
      expect(betOnlyTransactions.length).toBe(0);
      expect(addRoundTransactions.mock.calls[0][0].length).toBe(expectedRoundTransactions);
      expect(addRoundTransactions).toHaveBeenCalledTimes(1);
    } catch {
      expect(true).toBe(false);
    }
  });
  it('/protected/round/addround - returns 200 if all is well with baboons with bets', async () => {
    try {
      const addRoundJSON = generateMockPayload(true, true);
      const findTroopResponse = addRoundJSON.chosenBaboons
        .filter((baboon) => baboon.registered === true)
        .map((baboon) => ({
          ...baboon,
          troopStatus: 'approved',
        }));

      getOneCourse.mockResolvedValue({
        Items: [generateMockCourseJSON()],
      });
      findAllTroop.mockResolvedValue({ Items: findTroopResponse });
      addRoundTransactions.mockResolvedValue(true);

      const expectedRoundTransactions = addRoundJSON.chosenBets.games.length === 0 ? findTroopResponse.length + 1 : findTroopResponse.length * 2 + 2;
      const response = await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      const betOnlyTransactions = addRoundTransactions.mock.calls[0][0].filter((item) => item.Put.Item.baboontype.includes('bet'));

      // checks to be sure the baboons are added to the holeData, even the ones that are not registered
      addRoundTransactions.mock.calls[0][0][0].Put.Item.holeData.forEach((hole) => {
        addRoundJSON.chosenBaboons.forEach((baboon) => {
          expect(hole).toHaveProperty(baboon.baboonFriendId);
        });
      });

      betOnlyTransactions.forEach((transaction) => {
        transaction.Put.Item.gamesPlayed.forEach((game) => {
          expect(game.results).toHaveProperty('mockedBaboonId');
          addRoundJSON.chosenBaboons.forEach((baboon) => {
            expect(game.results).toHaveProperty(baboon.baboonFriendId);
            expect(game.results).toHaveProperty(`${baboon.baboonFriendId}_money`);
          });
        });
      });

      // addRoundTransactions.mock.calls[0][0][0].Put.Item.holeData
      expect(response.status).toBe(200);
      expect(betOnlyTransactions.length).toBe(expectedRoundTransactions / 2);
      expect(addRoundTransactions.mock.calls[0][0].length).toBe(expectedRoundTransactions);
      expect(addRoundTransactions).toHaveBeenCalledTimes(1);
    } catch  {
      expect(true).toBe(false);
    }
  });
  it('/protected/round/addround - returns 200 if all is well with solo round', async () => {
    try {
      const addRoundJSON = generateMockPayload(false);
      const findTroopResponse = addRoundJSON.chosenBaboons
        .filter((baboon) => baboon.registered === true)
        .map((baboon) => ({
          ...baboon,
          troopStatus: 'approved',
        }));

      getOneCourse.mockResolvedValue({
        Items: [generateMockCourseJSON()],
      });
      findAllTroop.mockResolvedValue({ Items: findTroopResponse });
      addRoundTransactions.mockResolvedValue(true);

      const response = await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      expect(response.status).toBe(200);
      // check addRoundTransactions is called with the correct amount of arguments
      expect(addRoundTransactions).toHaveBeenCalledTimes(1);
      expect(addRoundTransactions.mock.calls[0][0].length).toBe(1);
    } catch {
      expect(true).toBe(false);
    }
  });
  it('/protected/round/addround - returns 500 if getOneCourse fails', async () => {
    try {
      const addRoundJSON = generateMockPayload();
      const findTroopResponse = addRoundJSON.chosenBaboons
        .filter((baboon) => baboon.registered === true)
        .map((baboon) => ({
          ...baboon,
          troopStatus: 'approved',
        }));

      getOneCourse.mockRejectedValue();
      findAllTroop.mockResolvedValue({ Items: findTroopResponse });
      addRoundTransactions.mockResolvedValue(true);

      await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
  it('/protected/round/addround - returns 500 if findAllTroop fails', async () => {
    try {
      const addRoundJSON = generateMockPayload(true);

      getOneCourse.mockResolvedValue({
        Items: [generateMockCourseJSON()],
      });
      findAllTroop.mockRejectedValue(new Error('Error finding troop requests'));
      addRoundTransactions.mockResolvedValue();

      await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
  it('/protected/round/addround - returns 500 if addRoundTransactions fails', async () => {
    try {
      const addRoundJSON = generateMockPayload();
      const findTroopResponse = addRoundJSON.chosenBaboons
        .filter((baboon) => baboon.registered === true)
        .map((baboon) => ({
          ...baboon,
          troopStatus: 'approved',
        }));

      getOneCourse.mockResolvedValue({
        Items: [generateMockCourseJSON()],
      });
      findAllTroop.mockResolvedValue({ Items: findTroopResponse });
      addRoundTransactions.mockRejectedValue();

      await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  const requiredFields = ['state', 'city_uuid', 'roundName', 'totalWinLoss'];
  requiredFields.forEach((field) => {
    it(`/protected/round/addround - returns 400 if ${field} is not in payload`, async () => {
      const addRoundJSON = generateMockPayload(true, true);

      delete addRoundJSON[field];

      try {
        const findTroopResponse = addRoundJSON.chosenBaboons
          .filter((baboon) => baboon.registered === true)
          .map((baboon) => ({
            ...baboon,
            troopStatus: 'approved',
          }));

        getOneCourse.mockResolvedValue({
          Items: [generateMockCourseJSON()],
        });
        findAllTroop.mockResolvedValue({ Items: findTroopResponse });
        addRoundTransactions.mockResolvedValue(true);

        await axios.post(`${baseURL}/api/v2/protected/round/addround`, addRoundJSON);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
