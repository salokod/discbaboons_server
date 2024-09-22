import Joi from 'joi';
import { deleteBagById } from '../../discBaboonUserDataBaseDynamo.js';

const schema = Joi.object({
  bagId: Joi.string().required(),
});

const deleteBagController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const baboontype = req.body.bagId;

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newBagJSON = {
      baboonid,
      baboontype,
    };
    try {
      await deleteBagById(newBagJSON);
      return res.status(200).json({ message: 'Bag Deleted Successfully' });
    } catch {
      return res
        .status(500)
        .json({ message: 'Error Deleting Bag, try again later' });
    }
  } catch {
    return res.status(500).json({ message: 'Error, try again later.' });
  }
};

export default deleteBagController;
