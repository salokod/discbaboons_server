import { findAllDiscs } from '../../discBaboonUserDataBaseDynamo.js';

const findAllDiscsController = async (req, res) => {
  const baboonid = req.jwt.id;
  try {
    const response = await findAllDiscs(baboonid);
    return res.status(200).json({ message: 'Found all these discs, you baboon...', discs: response.Items });
  } catch {
    return res.status(500).json({ message: 'Disc not added.  Try again!' });
  }
};

export default findAllDiscsController;
