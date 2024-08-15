import Joi from 'joi';
import { addToUserTable, findOneBag } from '../../discBaboonUserDataBaseDynamo.js';

const editDiscController = async (req, res) => {
  const baboonid = req.jwt.id;
  const {
    baboontype,
    bagId,
    brand,
    dateOfPurchase,
    disc,
    discColor,
    discPlastic,
    discType,
    fade,
    glide,
    speed,
    turn,
    weight,
  } = req.body;

  const schema = Joi.object({
    brand: Joi.string().required(),
    baboontype: Joi.string().required(),
    disc: Joi.string().required(),
    bagId: Joi.string().required(),
    speed: Joi.number().required(),
    glide: Joi.number().required(),
    turn: Joi.number().required(),
    fade: Joi.number().required(),
    discColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required(),
    dateOfPurchase: Joi.date().required(),
    discType: Joi.string().allow(''),
    discPlastic: Joi.string().allow(''),
    weight: Joi.string().allow(''),
  });

  try {
    const payload = {
      baboonid,
      baboontype,
      brand,
      disc,
      bagId,
      speed,
      glide,
      turn,
      fade,
      discColor,
      dateOfPurchase,
      discType,
      discPlastic,
      weight,
    };

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const getBagResponse = await findOneBag(baboonid, payload.bagId);
    if (getBagResponse.Items.length === 0) {
      return res.status(404).json({ message: 'Bag not found' });
    }
    await addToUserTable(payload);
    return res.status(200).json({ message: 'Disc Edited Successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Disc not edited.  Try again!' });
  }
};

export default editDiscController;
