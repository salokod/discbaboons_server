import Joi from 'joi';
import { updateRoundTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const submitRoundController = async (req, res) => {
  const baboonSchema = Joi.object({
    baboonUsername: Joi.string().required(),
    baboonId: Joi.string().guid().required(),
  });

  const otherBaboonSchema = Joi.object({
    baboonFriendUsername: Joi.string().required(),
    baboonFriendId: Joi.string().required(),
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
    otherBaboons_bet: Joi.array().items(otherBaboonSchema),
    baboontype_bet: Joi.string(),
    baboonid_bet: Joi.string(),
    gamesPlayed_bet: Joi.array().items(gamesPlayedSchema),
    baboontype: Joi.string().required(),
    baboonid: Joi.string().guid().required(),
    otherBaboons: Joi.array().items(otherBaboonSchema),
  });

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const baboonid = req.jwt.id;
    const {
       
      baboontype, otherBaboons, baboontype_bet, otherBaboons_bet, gamesPlayed_bet,
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

     
    if (baboontype_bet !== undefined) {
       
      const mainUserPayload_bets = {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid,
             
            baboontype: baboontype_bet,
          },
          UpdateExpression:
              'set roundStatus = :roundStatus, gamesPlayed = :gamesPlayed',
          ExpressionAttributeValues: {
            ':roundStatus': roundStatus,
             
            ':gamesPlayed': gamesPlayed_bet,
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      transactionData.push(mainUserPayload_bets);

       
      otherBaboons_bet.forEach((baboon) => {
         
        const additionalUsersPayload_bets = {
          Update: {
            TableName: 'DiscBaboonUserData',
            Key: {
              baboonid: baboon.baboonFriendId,
               
              baboontype: baboontype_bet,
            },
            UpdateExpression:
                'set roundStatus = :roundStatus, gamesPlayed = :gamesPlayed',
            ExpressionAttributeValues: {
              ':roundStatus': roundStatus,
               
              ':gamesPlayed': gamesPlayed_bet,
            },
            ReturnValues: 'ALL_NEW',
          },
        };
        transactionData.push(additionalUsersPayload_bets);
      });
    }

    await updateRoundTransaction(transactionData);
    return res.status(200).json({ message: 'Round update success' });
  } catch {
    return res.status(500).json({ message: 'Error submitting round' });
  }
};

export default submitRoundController;
