import bcrypt from 'bcrypt';
import Joi from 'joi';
import { addUserToUserDatabase, findOneUserName } from '../userDatabaseDynamo.js';
import { findResetUniqueCode } from '../userTokenDynamo.js';

const schema = Joi.object({
  requestUUID: Joi.string().required(),
  code: Joi.number().required(),
  newPassword: Joi.string().required(),
});

const changePasswordController = async (req, res) => {
  try {
    const { requestUUID, code, newPassword } = req.body;

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const uuidExist = await findResetUniqueCode(requestUUID);

    if (uuidExist.Count === 1) {
      const { uniqueCode } = uuidExist.Items[0];
      const uuidUsername = uuidExist.Items[0].username;

      if (code === uniqueCode) {
        const saltRounds = 12;
        const hash = bcrypt.hashSync(newPassword, saltRounds);

        const findUser = await findOneUserName(uuidUsername);

        const userPayload = {
          username: uuidUsername,
          password: hash,
          dateCreated: findUser.Items[0].dateCreated,
          isAdmin: findUser.Items[0].isAdmin,
          id: findUser.Items[0].id,
          email: findUser.Items[0].email,
        };

        await addUserToUserDatabase(userPayload);

        return res.status(200).json({
          message: 'Password Changed.',
        });
      }
      return res.status(404).json({ message: 'Wrong Request or wrong code' });
    }
    return res.status(404).json({ message: 'Wrong Request or wrong code' });
  } catch {
    return res.status(500).json({ message: 'Error, try again later.' });
  }
};

export default changePasswordController;
