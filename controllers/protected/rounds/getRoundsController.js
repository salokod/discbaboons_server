import { findAllRounds } from '../../discBaboonUserDataBaseDynamo.js';

const deleteRoundController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const { Items, Count } = await findAllRounds(baboonid);

    return res.status(200).json({ message: 'Rounds retrieved', rounds: { Items, Count } });
  } catch {
    return res
      .status(500)
      .json({ message: 'Error retrieving rounds, try again later' });
  }
};

export default deleteRoundController;
