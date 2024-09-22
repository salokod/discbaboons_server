import { findAllTroop } from '../../discBaboonUserDataBaseDynamo.js';

const findTroopController = async (req, res) => {
  try {
    const response = await findAllTroop(req.jwt.id);
    res.status(200).json({
      message: 'Here is your troop, baboon.',
      yourTroop: response.Items,
    });
  } catch {
    res.status(500).json({ message: 'Error retrieving your troop, you baboon' });
  }
};

export default findTroopController;
