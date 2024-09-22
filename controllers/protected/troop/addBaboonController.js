import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import {
  findAllTroop,
  addBaboonTroopRequestsTransaction,
} from '../../discBaboonUserDataBaseDynamo.js';
import { findOneUserName } from '../../userDatabaseDynamo.js';
import todaysDateFunc from '../../../utils/easeOfUseFunc.js';

const addBaboonController = async (req, res) => {
  let { username } = req.body;
  const today = todaysDateFunc();

  const schema = Joi.object({
    username: Joi.string().required(),
  });
  try {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    username = username.toLowerCase();

    const baboonLookup = await findOneUserName(username);

    if (baboonLookup.Items.length === 0) {
      return res.status(404).json({ message: 'No Baboon found' });
    }

    if (baboonLookup.Items[0].id === req.jwt.id) {
      return res.status(403).json({
        message: 'You cannot add yourself to your troop, you baboon.',
      });
    }

    const newFriendUUID = uuidv4();
    const finalPayload = [
      {
        baboonid: baboonLookup.Items[0].id,
        baboontype: `#troopreq-${newFriendUUID}`,
        baboonFriendUsername: req.jwt.user,
        baboonFriendId: req.jwt.id,
        troopStatus: 'pending',
        dateOfRequest: today,
        dateReviewed: '',
      },
      {
        baboonid: req.jwt.id,
        baboontype: `#troopreq-${newFriendUUID}`,
        baboonFriendUsername: baboonLookup.Items[0].username,
        baboonFriendId: baboonLookup.Items[0].id,
        troopStatus: 'requested',
        dateOfRequest: today,
        dateReviewed: '',
      },
    ];

    const allBaboonTroops = await findAllTroop(req.jwt.id);

    if (allBaboonTroops.Items.length > 0) {
      const requestExist = allBaboonTroops.Items.some((item) => {
        const isSameFriendId = item.baboonFriendId === baboonLookup.Items[0].id;
        const isNotDenied = item.troopStatus !== 'denied';

        return isSameFriendId && isNotDenied;
      });

      if (requestExist) {
        return res.status(409).json({
          message: 'You baboon, the request already exists.',
        });
      }
    }

    await addBaboonTroopRequestsTransaction(finalPayload);

    return res.status(200).json({
      message: 'Troop Request Successful',
      response: allBaboonTroops.Items,
    });
  } catch{
    return res.status(500).json({ message: 'Error adding baboon to troop' });
  }
};

export default addBaboonController;
