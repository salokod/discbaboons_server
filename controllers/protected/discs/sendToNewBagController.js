import Joi from 'joi';
import { findOneBag, sendDiscToNewBagTransaction } from '../../discBaboonUserDataBaseDynamo.js';

const removeDiscsController = async (req, res) => {
  const baboonid = req.jwt.id;

  const { newBagId, discsToMove } = req.body;

  const schema = Joi.object({
    newBagId: Joi.string().required(),
    discsToMove: Joi.array().items(
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

    const newBagResponse = await findOneBag(baboonid, newBagId);

    if (newBagResponse.Items.length === 0) {
      return res.status(404).json({ message: 'Cannot move disc to bag that does not exist.' });
    }

    const discsTransactions = [];

    discsToMove.forEach((disc) => {
      const discTransact = {
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid,
            baboontype: disc.baboontype,
          },
          UpdateExpression: 'set bagId = :bagId',
          ExpressionAttributeValues: {
            ':bagId': newBagId,
          },
          ReturnValues: 'ALL_NEW',
        },
      };
      discsTransactions.push(discTransact);
    });

    await sendDiscToNewBagTransaction(discsTransactions);
    return res.status(200).json({ message: 'Discs moved successfully.' });
  } catch {
    return res.status(500).json({ message: 'Discs not moved.  Try again!' });
  }
};

export default removeDiscsController;
