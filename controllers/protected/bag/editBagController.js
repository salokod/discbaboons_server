import Joi from 'joi';
import { updateBag } from '../../discBaboonUserDataBaseDynamo.js';
import { IfPrimaryLogic } from '../../utils/ifPrimaryLogic.js';

const schema = Joi.object({
  bagId: Joi.string().required(),
  bagName: Joi.string().required(),
  bagColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required(),
  isPrimary: Joi.boolean().required(),
});

const editBagController = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const baboonid = req.jwt.id;
  const {
    bagName, bagId, isPrimary, bagColor,
  } = req.body;

  const newBagJSON = {
    baboonid,
    baboontype: bagId,
    bagName,
    bagColor,
    isPrimary,
  };
  try {
    await updateBag(newBagJSON);
    if (isPrimary) {
      await IfPrimaryLogic(bagId, baboonid);
    }
    return res
      .status(200)
      .json({ message: 'Bag edited successfully.' });
  } catch {
    return res.status(500).json({ message: 'Error editing bag.' });
  }
};

export default editBagController;
