import Joi from 'joi';
import {
  findOneTroopRequest,
  updateTroopReq,
} from '../../discBaboonUserDataBaseDynamo.js';

const troopChoiceController = async (req, res) => {
  const loggedInUser = req.jwt.id;
  const { choice, troopReq } = req.body;

  const schema = Joi.object({
    baboonReq: Joi.string().pattern(/^#troopreq-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).required(),
    choice: Joi.string().valid('approved', 'denied').required(),
  });

  try {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const response = await findOneTroopRequest(loggedInUser, troopReq);

    if (response.Items.length === 0) {
      return res.status(404).json({ message: 'No baboon troop request found' });
    }

    if (response.Items[0].troopStatus === 'pending') {
      return res.status(409).json({ message: 'Pending request exists, you baboon' });
    }

    const otherBaboon = response.Items[0].baboonFriendId;
    const baboonsToUpdateArray = [loggedInUser, otherBaboon];

    await updateTroopReq(baboonsToUpdateArray, troopReq, choice);

    return res.status(200).json({
      message: 'Updated troop request, you baboon',
    });
  } catch {
    return res.status(500).json({ message: 'Error updating troop status, you baboon' });
  }
};

export default troopChoiceController;
