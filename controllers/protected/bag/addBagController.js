import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { addToUserTable } from '../../discBaboonUserDataBaseDynamo.js';
import { IfPrimaryLogic } from '../../utils/ifPrimaryLogic.js';

const schema = Joi.object({
  bagName: Joi.string().required(),
  isPrimary: Joi.boolean().required(),
  bagColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required(),
});

const addBagController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const { bagName, bagColor, isPrimary } = req.body;
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const bagId = `#bag-${uuidv4()}`;

    const newBagJSON = {
      baboonid,
      baboontype: bagId,
      bagName,
      dateCreated: today,
      bagColor,
      lastModified: today,
      isPrimary,
    };

    await addToUserTable(newBagJSON);
    if (isPrimary) {
      await IfPrimaryLogic(bagId, baboonid, bagColor);
    }

    return res.status(200).json({ message: 'Bag added' });
  } catch (error) {
    return res.status(500).json({ message: 'Error, try again later.' });
  }
};

export default addBagController;
