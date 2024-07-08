import { findOneUserByEmail } from "../userDatabaseDynamo.js";
import { sendEmail } from "../../utils/sendEmail.js";
import Joi from "joi";

const forgotUsernameController = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
  });
  try {
    const { email } = req.body;

    await schema.validateAsync({ email: email });

    const userExist = await findOneUserByEmail(email);

    if (userExist.Count === 1) {
      const subject = "Seems like you forgot your username, you baboon.";
      const body = `Your username is ${userExist.Items[0].username}, you baboon.`;
      const htmlBody = `Your username is <b>${userExist.Items[0].username}</b>, you baboon.`;
      const emailSend = await sendEmail(subject, body, htmlBody, email);

      if (!emailSend) {
        return res.status(500).json({ message: "Email not sent, try again later." });
      }
    }
    return res.status(200).json({ message: "If an email matches our records, an email with username is on the way, you baboon..." });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      return res.status(400).json({ message: "Invalid input" });
    }
    return res.status(500).json({ message: "Signin unsuccessful, try again later." });
  }
};

export default forgotUsernameController;
