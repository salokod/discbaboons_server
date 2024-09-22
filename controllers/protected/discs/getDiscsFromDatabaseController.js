import { getAllDiscs } from '../../discTableDynamo.js';

const getDiscsFromDatabaseController = async (req, res) => {
  try {
    const response = await getAllDiscs();
    return res.status(200).json({ message: 'Here are the discs in the database, you baboon...', discs: response.Items });
  } catch {
    return res.status(500).json({ message: 'Error getting discs.  Try again!' });
  }
};

export default getDiscsFromDatabaseController;
