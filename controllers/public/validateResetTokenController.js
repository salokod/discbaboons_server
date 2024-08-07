import Joi from 'joi';
import { findResetUniqueCode } from '../userTokenDynamo.js';

const schema = Joi.object({
  requestUUID: Joi.string().required(),
  code: Joi.number().required(),
});

const validateResetTokenController = async (req, res) => {
  try {
    const { requestUUID, code } = req.body;

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const uuidExist = await findResetUniqueCode(requestUUID);

    if (uuidExist.Count === 1) {
      const { uniqueCode } = uuidExist.Items[0];

      if (code === uniqueCode) {
        return res.status(200).json({
          message: 'Correct code.',
        });
      }
      return res.status(404).json({ message: 'Wrong Request or wrong code' });
    }
    return res.status(404).json({ message: 'Wrong Request or wrong code' });
  } catch {
    // console.log("error", error);
    return res.status(500).json({ message: 'Error, try again later.' });
  }
};

export default validateResetTokenController;
