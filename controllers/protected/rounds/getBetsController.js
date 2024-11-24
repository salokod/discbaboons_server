import { findAllBets } from '../../discBaboonUserDataBaseDynamo.js';

const getBetsController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const { Items, Count } = await findAllBets(baboonid);

    return res.status(200).json({ message: 'Bets retrieved', bets: { Items, Count } });
  } catch {
    return res
      .status(500)
      .json({ message: 'Error retrieving bets, try again later' });
  }
};

export default getBetsController;
