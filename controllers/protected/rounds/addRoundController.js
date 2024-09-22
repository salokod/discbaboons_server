import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getOneCourse } from '../../courseTableDynamo.js';
import { findAllTroop, addRoundTransactions } from '../../discBaboonUserDataBaseDynamo.js';
import todaysDateFunc from '../../../utils/easeOfUseFunc.js';

const getApprovedBaboons = (items) => items.filter((troopReq) => troopReq.troopStatus === 'approved');

const checkForUnapprovedBaboons = (chosenBaboons, approvedArray) => chosenBaboons
  .filter((chosenBaboon) => chosenBaboon.registered !== false)
  .filter((chosenBaboon) => !approvedArray.some((approvedArrayItem) => chosenBaboon.baboonFriendId === approvedArrayItem.baboonFriendId));
const initializeTrackers = (baboonId) => {
  const skinsTracker = { [baboonId]: 0, [`${baboonId}_money`]: 0 };
  const sideTracker = { [baboonId]: 0, [`${baboonId}_money`]: 0 };
  return { skinsTracker, sideTracker };
};

const processChosenBaboon = (baboon, otherBaboonArray, baboonBetResponse, skinsTracker, sideTracker) => {
  otherBaboonArray.push({
    baboonFriendId: baboon.baboonFriendId,
    baboonFriendUsername: baboon.baboonFriendUsername,
  });
  baboonBetResponse[0].holeData.forEach((hole) => {
     
    hole[baboon.baboonFriendId] = 0;
  });
   
  skinsTracker[baboon.baboonFriendId] = 0;
   
  skinsTracker[`${baboon.baboonFriendId}_money`] = 0;
   
  sideTracker[baboon.baboonFriendId] = 0;
   
  sideTracker[`${baboon.baboonFriendId}_money`] = 0;
};

const processBet = (bet, skinsTracker, sideTracker) => {
  if (bet.betType === 'skins') {
    return {
      game: bet.betType,
      results: skinsTracker,
    };
  }
  return {
    game: bet.betType,
    results: sideTracker,
    details: [],
  };
};

// eslint-disable-next-line no-unused-vars
const createClone = (item) => (({ holeData, ...o }) => o)(item);

const createPayload = (baboonId, baboontypeRound, baboonUsername, clone, today, roundName, holeData, otherBaboonArray) => ({
  Put: {
    Item: {
      baboonid: baboonId,
      baboontype: baboontypeRound,
      baboonUsername,
      roundData: clone,
      scoreInfo: null,
      dateOfRound: today,
      roundName,
      holeData,
      roundStatus: 'pending',
      otherBaboons: otherBaboonArray,
    },
    TableName: 'DiscBaboonUserData',
  },
});

const createBaboonBetPayload = (baboonId, baboontypeBaboonBet, baboonUsername, chosenBets, baboonBetResponse, gamesPlayed, totalWinLoss, roundName, otherBaboonArray, today) => ({
  Put: {
    Item: {
      baboonid: baboonId,
      baboontype: baboontypeBaboonBet,
      baboonUsername,
      skinsAmount: chosenBets.skinsAmount,
      // eslint-disable-next-line no-unused-vars
      betData: baboonBetResponse.map(({ holeData, ...keepAttrs }) => keepAttrs)[0],
      gamesPlayed,
      totalWinLoss,
      roundName,
      otherBaboons: otherBaboonArray,
      dateOfBet: today,
    },
    TableName: 'DiscBaboonUserData',
  },
});

const addRoundController = async (req, res) => {
  const baboonId = req.jwt.id;
  const baboonUsername = req.jwt.user;
  const {
     
    chosenBaboons, chosenBets, totalWinLoss, roundName, state, city_uuid,
  } = req.body;

  const baboonSchema = Joi.object({
    baboonFriendId: Joi.string().guid({ version: 'uuidv4' }).required(),
    baboonFriendUsername: Joi.string().required(),
    registered: Joi.boolean().required(),
  });

  const betSchema = Joi.object({
    betType: Joi.string().valid('side', 'skins').required(),
    label: Joi.string().required(),
  });

  const chosenBetsSchema = Joi.object({
    games: Joi.array().items(betSchema).default([]),
    skinsAmount: Joi.number().required(),
  });

  const schema = Joi.object({
    state: Joi.string().length(2).required(),
    city_uuid: Joi.string().required(),
    roundName: Joi.string().required(),
    chosenBaboons: Joi.array().items(baboonSchema).default([]),
    chosenBets: chosenBetsSchema.default({ games: [], skinsAmount: 0 }),
    totalWinLoss: Joi.number().required(),
  });

  const today = todaysDateFunc();
  const reusableUuid = uuidv4();

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const courseResponse = await getOneCourse(state, city_uuid);
    const baboontypeRound = `#round-${reusableUuid}`;
    const baboontypeBaboonBet = `#baboonbet-${reusableUuid}`;
    const baboonBetResponse = courseResponse.Items;
    const otherBaboonArray = [];
    const roundTransactions = [];

    if (courseResponse.Items.length === 0) {
      return res.status(404).json({ message: 'Course not found, please try again.' });
    }

    if (chosenBaboons.length > 0) {
      const troopResponse = await findAllTroop(baboonId);
      const approvedArray = getApprovedBaboons(troopResponse.Items);
      const unapprovedBaboons = checkForUnapprovedBaboons(chosenBaboons, approvedArray);

      if (unapprovedBaboons.length > 0) {
        return res.status(400).json({ message: 'One or more of the chosen baboons are not approved.' });
      }
    }

    const { skinsTracker, sideTracker } = initializeTrackers(baboonId);

    chosenBaboons.forEach((baboon) => {
      processChosenBaboon(baboon, otherBaboonArray, baboonBetResponse, skinsTracker, sideTracker);
    });

    const gamesPlayed = chosenBets.games.map((bet) => processBet(bet, skinsTracker, sideTracker));

     
    baboonBetResponse[0].holeData.forEach((hole) => (hole[baboonId] = 0));

    const clone = createClone(courseResponse.Items[0]);

    const payload = createPayload(baboonId, baboontypeRound, baboonUsername, clone, today, roundName, courseResponse.Items[0].holeData, otherBaboonArray);
    roundTransactions.push(payload);

    if (chosenBets.games.length > 0 && chosenBaboons.length > 0) {
      const baboonBetPayload = createBaboonBetPayload(baboonId, baboontypeBaboonBet, baboonUsername, chosenBets, baboonBetResponse, gamesPlayed, totalWinLoss, roundName, otherBaboonArray, today);
      roundTransactions.push(baboonBetPayload);
    }

    chosenBaboons.forEach((friendBaboon) => {
      if (friendBaboon.registered !== false || friendBaboon.registered === undefined) {
         
        const otherBaboonArray = chosenBaboons
          .filter((filteredBaboon) => filteredBaboon.baboonFriendId !== friendBaboon.baboonFriendId)
          .map((filteredBaboon) => ({
            baboonFriendId: filteredBaboon.baboonFriendId,
            baboonFriendUsername: filteredBaboon.baboonFriendUsername,
          }));
        otherBaboonArray.push({
          baboonFriendId: baboonId,
          baboonFriendUsername: baboonUsername,
        });

        const friendPayload = createPayload(friendBaboon.baboonFriendId, baboontypeRound, friendBaboon.baboonFriendUsername, clone, today, roundName, courseResponse.Items[0].holeData, otherBaboonArray);
        roundTransactions.push(friendPayload);

        if (chosenBets.games.length > 0) {
          const friendBaboonBetPayload = createBaboonBetPayload(friendBaboon.baboonFriendId, baboontypeBaboonBet, friendBaboon.baboonFriendUsername, chosenBets, baboonBetResponse, gamesPlayed, totalWinLoss, roundName, otherBaboonArray, today);
          roundTransactions.push(friendBaboonBetPayload);
        }
      }
    });

    await addRoundTransactions(roundTransactions);
    return res.status(200).json({
      message: 'Round created successfully.',
      roundInfo: baboontypeRound.replace('#', ''),
    });
  } catch {
    return res.status(500).json({ message: 'Round not added.  Try again!' });
  }
};

export default addRoundController;
