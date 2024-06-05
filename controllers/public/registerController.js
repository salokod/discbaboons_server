const registerController = async (req, res) => {
  try {
    return res.status(200).json({ message: "Registration successful, you baboon" });
  } catch {
    return res.status(500).json({ message: "Signin unsuccessful, try again later." });
  }
};

export default registerController;
