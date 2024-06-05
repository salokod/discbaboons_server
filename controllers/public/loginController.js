import { generateAccessToken, generateRefreshToken, addToList } from "../../utils/authUtils.js";
import { CreateActCookie, CreateRtCookie } from "../../utils/cookieUtils.js";
import { findOneUserName } from "../../controllers/userDatabaseDynamo.js";
import bcrypt from "bcrypt";

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: "Username must be greater than three characters, less than 30" });
    }
    //if username is greater than 3 and less than 30
    const userExist = await findOneUserName(username);
    if (userExist.Count === 0) {
      return res.status(400).json({ message: "Login failed, try again later" });
    }

    const hashPassword = userExist.Items[0].password;
    const validPassword = bcrypt.compareSync(password, hashPassword);
    if (!validPassword) {
      return res.status(400).json({ message: "Login failed, try again later" });
    }

    const token = generateAccessToken(req.body.username.toLowerCase(), userExist.Items[0].email, userExist.Items[0].isAdmin, userExist.Items[0].id);
    const refreshToken = generateRefreshToken(req.body.username.toLowerCase(), userExist.Items[0].email, userExist.Items[0].isAdmin, userExist.Items[0].id);
    await addToList(req.body.username.toLowerCase(), refreshToken);

    CreateActCookie(req, res, token);
    CreateRtCookie(req, res, refreshToken);

    return res.status(200).json({ message: "Signin successful" });
  } catch {
    return res.status(500).json({ message: "Signin unsuccessful, try again later." });
  }
};

export default loginController;
