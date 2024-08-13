import { v4 as uuidv4 } from 'uuid';
import { addToUserTable } from '../../discBaboonUserDataBaseDynamo.js';

const addDiscController = async (req, res) => {
  const baboonid = req.jwt.id;
  const {
    brand, disc, bagId, speed, glide, turn, fade, discColor, dateOfPurchase, discType, discPlastic, weight,
  } = req.body;
  const discId = `#disc-${uuidv4()}`;

  const payload = {
    baboonid,
    baboontype: discId,
    brand,
    disc,
    bagId,
    speed,
    glide,
    turn,
    fade,
    discColor,
    dateOfPurchase,
    discType,
    discPlastic,
    weight,
  };
  try {
    await addToUserTable(payload);
    res.status(200).json({ message: 'Disc Added Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Disc not added.  Try again!' });
  }
};

export default addDiscController;
