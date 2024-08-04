const addBagController = async (req, res) => {
  try {
    res.status(200).json({ message: "Bag added", jwt: req.jwt });
  } catch {
    res.status(500).json({ message: "Error, try again later." });
  }
};

export default addBagController;
