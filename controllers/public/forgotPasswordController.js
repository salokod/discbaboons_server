import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { findOneUserName } from '../userDatabaseDynamo.js';
import { addTokenToTable } from '../userTokenDynamo.js';
import { sendEmail } from '../../utils/sendEmail.js';

const forgotPasswordController = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30)
      .required(),
  });

  try {
    const { username } = req.body;

    await schema.validateAsync({ username });

    const userExist = await findOneUserName(username.toLowerCase());
    const urlUuid = uuidv4();
    if (userExist.Count === 1) {
      const uniqueCode = Math.floor(100000 + Math.random() * 900000);
      const TTL_DELTA = 60 * 60; // Keep records for 1 hour

      await addTokenToTable({
        lookupitem: `resetpassid:${username}`,
        urlUuid,
        uniqueCode,
        username,
        refresh_ttl: Math.floor(+new Date() / 1000) + TTL_DELTA,
      });

      const subject = 'Reset password instructions, you baboon...';
      const body = `Return to your DiscBaboons app and enter this code:\n ${uniqueCode}\n\n.  This code will be good for 1 hour.`;
      const htmlBody = `Return to your DiscBaboons app and enter this code:\n <b>${uniqueCode}</b>\n\n. This code will be good for 1 hour.`;
      const emailSend = await sendEmail(subject, body, htmlBody, userExist.Items[0].email);

      if (!emailSend) {
        return res.status(500).json({ message: 'Email not sent, try again later.' });
      }
    }
    return res.status(200).json({ message: 'An email will be sent to the email address on file, if username exists...', urlUuid });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    return res.status(500).json({ message: 'Signin unsuccessful, try again later.' });
  }
};

export default forgotPasswordController;
