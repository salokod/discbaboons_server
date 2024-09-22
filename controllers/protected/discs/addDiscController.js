import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { addToUserTable } from '../../discBaboonUserDataBaseDynamo.js';

const addDiscController = async (req, res) => {
  const baboonid = req.jwt.id;
  const {
    brand, disc, bagId, speed, glide, turn, fade, discColor, dateOfPurchase, discType, discPlastic, weight,
  } = req.body;

  const schema = Joi.object({
    brand: Joi.string().required(),
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
    const discId = `#disc-${uuidv4()}`;
    const payload = {
      baboonid,
      baboontype: discId,
      brand,
      disc,
      bagId,
      speed,
      glide,
      turn,
      fade,
      discColor,
      dateOfPurchase,
      discStatus: 'active',
      discType,
      discPlastic,
      weight,
    };

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await addToUserTable(payload);
    return res.status(200).json({ message: 'Disc Added Successfully' });
  } catch {
    return res.status(500).json({ message: 'Disc not added.  Try again!' });
  }
};

export default addDiscController;
