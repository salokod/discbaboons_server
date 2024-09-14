import Joi from 'joi';
import { updateRoundTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const updateRoundController = async (req, res) => {
  const baboonid = req.jwt.id;

  const {
    baboontype, holeData, otherBaboons, scoreInfo,
  } = req.body;

  const otherBaboonSchema = Joi.object({
    baboonFriendUsername: Joi.string().required(),
    baboonFriendId: Joi.string().required(),
  });

  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const holeDataSchema = Joi.object({
    par: Joi.string().required(),
    distance: Joi.string().required(),
    holeNumber: Joi.string().required(),
  }).pattern(uuidPattern, Joi.number().required());

  const uuidPatternScores = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_(score|par)$/;

  const scoreInfoSchema = Joi.object({
    roundPar: Joi.number().required(),
  }).pattern(uuidPatternScores, Joi.number().required());

  const schema = Joi.object({
    baboontype: Joi.string().required(),
    holeData: Joi.array().items(holeDataSchema).required(),
    otherBaboons: Joi.array().items(otherBaboonSchema).required(),
    scoreInfo: scoreInfoSchema.required(),
  });

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const transactionData = [];
    const mainUserPayload = {
      Update: {
        TableName: 'DiscBaboonUserData',
        Key: {
          baboonid,
          baboontype,
        },
        UpdateExpression: 'set holeData = :holeData, scoreInfo = :scoreInfo',
        ExpressionAttributeValues: {
          ':holeData': holeData,
          ':scoreInfo': scoreInfo,
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
          UpdateExpression: 'set holeData = :holeData, scoreInfo = :scoreInfo',
          ExpressionAttributeValues: {
            ':holeData': holeData,
            ':scoreInfo': scoreInfo,
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      transactionData.push(additionalUsersPayload);
    });

    await updateRoundTransaction(transactionData);
    return res.status(200).json({ message: 'Round update success' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating round' });
  }
};

export default updateRoundController;
