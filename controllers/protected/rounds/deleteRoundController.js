import Joi from 'joi';
import { deleteRoundById } from '../../discBaboonUserDataBaseDynamo.js';

const deleteRoundController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const baboontype = req.body.roundId;
    const deleteRoundJSON = {
      baboonid,
      baboontype,
    };
    const schema = Joi.object({
      roundId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await deleteRoundById(deleteRoundJSON);
    return res.status(200).json({ message: 'Round Deleted Successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error Deleting Round, try again later' });
  }
};

export default deleteRoundController;
