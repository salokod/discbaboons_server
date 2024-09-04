import Joi from 'joi';
import { updateRoundTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const submitRoundController = async (req, res) => {
  const baboonSchema = Joi.object({
    baboonFriendUsername: Joi.string().required(),
    baboonFriendId: Joi.string().guid().required(),
  });

  const gameResultsSchema = Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.number(), Joi.string()),
  );

  const gameDetailsSchema = Joi.object({
    sideBetBaboons: Joi.array().items(baboonSchema).required(),
    sideBetAmount: Joi.number().required(),
    sideBetLabel: Joi.string().required(),
    typeOfSideBet: Joi.string().required(),
    hole: Joi.number().required(),
    status: Joi.string().required(),
    winnerId: Joi.string().guid().required(),
    winnerUsername: Joi.string().required(),
  });

  const gamesPlayedSchema = Joi.object({
    results: gameResultsSchema.required(),
    game: Joi.string().required(),
    details: Joi.array().items(gameDetailsSchema),
  });

  const schema = Joi.object({
    otherBaboons_bet: Joi.array().items(baboonSchema),
    baboontype_bet: Joi.string(),
    baboonid_bet: Joi.string(),
    gamesPlayed_bet: Joi.array().items(gamesPlayedSchema),
    baboontype: Joi.string().required(),
    baboonid: Joi.string().guid().required(),
    otherBaboons: Joi.array().items(baboonSchema),
  });

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const baboonid = req.jwt.id;
    const {
      baboontype, otherBaboons, baboonTypeBet, otherBaboonBet, gamesPlayedBet,
    } = req.body;
    const roundStatus = 'completed';

    const transactionData = [];
    const mainUserPayload = {
      Update: {
        TableName: 'DiscBaboonUserData',
        Key: {
          baboonid,
          baboontype,
        },
        UpdateExpression: 'set roundStatus = :roundStatus',
        ExpressionAttributeValues: {
          ':roundStatus': roundStatus,
        },
        ReturnValues: 'ALL_NEW',
      },
    };
    transactionData.push(mainUserPayload);

    otherBaboons.forEach((baboon) => {
      const additionalUsersPayload = {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid: baboon.baboonFriendId,
            baboontype,
          },
          UpdateExpression: 'set roundStatus = :roundStatus',
          ExpressionAttributeValues: {
            ':roundStatus': roundStatus,
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      transactionData.push(additionalUsersPayload);
    });

    if (baboonTypeBet !== undefined) {
      const mainUserPayloadBets = {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid,
            baboontype: baboonTypeBet,
          },
          UpdateExpression:
              'set roundStatus = :roundStatus, gamesPlayed = :gamesPlayed',
          ExpressionAttributeValues: {
            ':roundStatus': roundStatus,
            ':gamesPlayed': gamesPlayedBet,
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      transactionData.push(mainUserPayloadBets);

      otherBaboonBet.forEach((baboon) => {
        const additionalUsersPayloadBets = {
          Update: {
            TableName: 'DiscBaboonUserData',
            Key: {
              baboonid: baboon.baboonFriendId,
              baboontype: baboonTypeBet,
            },
            UpdateExpression:
                'set roundStatus = :roundStatus, gamesPlayed = :gamesPlayed',
            ExpressionAttributeValues: {
              ':roundStatus': roundStatus,
              ':gamesPlayed': gamesPlayedBet,
            },
            ReturnValues: 'ALL_NEW',
          },
        };
        transactionData.push(additionalUsersPayloadBets);
      });
    }
    await updateRoundTransaction(transactionData);
    return res.status(200).json({ message: 'Round update success' });
  } catch (error) {
    return res.status(500).json({ message: 'Round update failed' });
  }
};

export default submitRoundController;
