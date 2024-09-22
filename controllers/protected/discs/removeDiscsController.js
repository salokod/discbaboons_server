import Joi from 'joi';
import { deleteDiscsTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const removeDiscsController = async (req, res) => {
  const baboonid = req.jwt.id;

  const {
    transitionedDiscs,
  } = req.body;

  const schema = Joi.object({
    transitionedDiscs: Joi.array().items(
      Joi.object({
        baboontype: Joi.string().required(),
      }),
    ).required(),
  });

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const discsTransactions = [];
    transitionedDiscs.forEach((disc) => {
      const discTransact = {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid,
            baboontype: disc.baboontype,
          },
          UpdateExpression: 'set bagId = :bagId, discStatus = :discStatus',
          ExpressionAttributeValues: {
            ':bagId': null,
            ':discStatus': 'removed',
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      discsTransactions.push(discTransact);
    });

    await deleteDiscsTransaction(discsTransactions);
    return res.status(200).json({ message: 'Discs removed successfully.' });
  } catch {
    return res.status(500).json({ message: 'Disc not added.  Try again!' });
  }
};

export default removeDiscsController;
