import { findAllBags } from '../../discBaboonUserDataBaseDynamo.js';

const findAllBagController = async (req, res) => {
  try {
    const baboonid = req.jwt.id;
    const response = await findAllBags(baboonid);

    return res.status(200).json({
      count: response.Count,
      bags: response.Items.sort((a, b) => {
        if (b.isPrimary !== a.isPrimary) {
          return b.isPrimary - a.isPrimary;
        }
        return a.bagName.localeCompare(b.bagName);
      }),
    });
  } catch {
    return res.status(500).json({ message: 'Error finding all bags' });
  }
};

export default findAllBagController;
