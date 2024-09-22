import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { findOneUserName, findOneUserByEmail, addUserToUserDatabase } from '../userDatabaseDynamo.js';
import todaysDateFunc from '../../utils/easeOfUseFunc.js';
import { generateAccessToken, generateRefreshToken, addToList } from '../../utils/authUtils.js';
import { CreateActCookie, CreateRtCookie } from '../../utils/CookieUtils.js';

const registerController = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
  });

  try {
    const { username, password, email } = req.body;
    await schema.validateAsync({ username, password, email });

    const userAlreadyExist = await findOneUserName(username.toLowerCase());

    if (userAlreadyExist.Count > 0) {
      return res.status(400).json({ message: 'Username or email already used. Please try again.' });
    }

    const emailAlreadyExist = await findOneUserByEmail(email.toLowerCase());

    if (emailAlreadyExist.Count > 0) {
      return res.status(400).json({ message: 'Username or email already used. Please try again.' });
    }

    const saltRounds = 12;
    const hash = bcrypt.hashSync(password, saltRounds);

    const today = todaysDateFunc();

    const userPayload = {
      id: uuidv4(),
      username: username.toLowerCase(),
      password: hash,
      email: email.toLowerCase(),
      isAdmin: false,
      dateCreated: today,
    };
    // eslint-disable-next-line no-unused-vars
    const { password: nothingHere, isAdmin, ...responsePayLoad } = userPayload;

    await addUserToUserDatabase(userPayload);

    try {
      const token = generateAccessToken(req.body.username, req.body.email, false, userPayload.id);
      const refreshToken = generateRefreshToken(req.body.username, req.body.email, false, userPayload.id);
      await addToList(req.body.username, refreshToken);

      CreateActCookie(req, res, token);
      CreateRtCookie(req, res, refreshToken);
      return res.status(200).json({
        message: 'Registration successful, you baboon...', user: responsePayLoad, token, rt: refreshToken, tokenTTL: Math.floor(+new Date() / 1000) + 60 * 60 * 24 * 7, cookieSet: true,
      });
    } catch {
      return res.status(200).json({ message: 'Something went wrong, try again.', user: responsePayLoad, cookieSet: false });
    }
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    return res.status(500).json({ message: 'Something went wrong, try again.' });
  }
};

export default registerController;
