import jwt from 'jsonwebtoken';
import { addTokenToTable, findOneToken } from '../controllers/userTokenDynamo';
import { findOneUserName } from '../controllers/userDatabaseDynamo';
import { CreateActCookie, CreateRtCookie } from './CookieUtils';

export function generateAccessToken(username, email, isAdmin, id) {
  // console.log("signed id", id);
  return jwt.sign({
    user: username, email, isAdmin, id,
  }, process.env.SECRET_TOKEN, {
    expiresIn: '7d',
  });
}

export function generateRefreshToken(username, email, isAdmin, id) {
  return jwt.sign({
    user: username, email, isAdmin, id,
  }, process.env.SECRET_RTOKEN, {
    expiresIn: '30d',
  });
}

export async function addToList(user, refresher) {
  const TTL_DELTA = 60 * 60 * 24 * 30; // Keep records for 30 days
  // const TTL_DELTA = 60; //Keep records for 30 days

  try {
    await addTokenToTable({
      lookupitem: `refresh:${user}`,
      refresher,
      refresh_ttl: Math.floor(+new Date() / 1000) + TTL_DELTA,
    });
  } catch { /* empty */ }
}
export async function addToListMobile(user, refresher) {
  const TTL_DELTA = 60 * 60 * 24 * 30; // Keep records for 30 days
  // const TTL_DELTA = 60; //Keep records for 30 days

  try {
    await addTokenToTable({
      lookupitem: `refreshAppToken:${user}`,
      refresher,
      refresh_ttl: Math.floor(+new Date() / 1000) + TTL_DELTA,
    });
  } catch { /* empty */ }
}

// eslint-disable-next-line consistent-return
export async function tokenRefresh(req, res, refreshtoken) {
  let decoded = '';
  decoded = jwt.verify(refreshtoken, process.env.SECRET_RTOKEN);
  if (!decoded) {
    return {
      message: "Can't refresh. Invalid Token.",
      refreshed: false,
    };
  }

  if (decoded) {
    try {
      const response = await findOneToken(`refresh:${decoded.user}`);
      const rtoken = response.Items.length > 0 ? response.Items[0].refresher : 'null';

      if (rtoken !== refreshtoken) {
        return {
          message: "Can't refresh. Invalid Token.",
          refreshed: false,
        };
      }
      const user = await findOneUserName(decoded.user);
      // console.log("findOneUser", user);
      const token = generateAccessToken(decoded.user, user.Items[0].email, user.Items[0].isAdmin, user.Items[0].id);
      const refreshToken = generateRefreshToken(decoded.user, user.Items[0].email, user.Items[0].isAdmin, user.Items[0].id);

      await addToList(decoded.user, refreshToken);

      await CreateActCookie(req, res, token);
      await CreateRtCookie(req, res, refreshToken);

      const content = {
        user: decoded.user,
        email: user.Items[0].email,
        isAdmin: user.Items[0].isAdmin,
        id: user.Items[0].id,
      };
      return {
        message: 'Token Refreshed',
        refreshed: true,
        content,
        JWT: token,
        refresh: refreshToken,
      };
    } catch (error) {
      return error.message;
      // console.log(error);
    }
  }
}
// eslint-disable-next-line consistent-return
export async function tokenRefreshApp(req, res, refreshtoken) {
  let decoded = '';
  try {
    decoded = jwt.verify(refreshtoken, process.env.SECRET_RTOKEN);
  } catch {
    return {
      message: "Can't refresh. Invalid Token.",
      refreshed: false,
    };
  }
  if (decoded) {
    try {
      const response = await findOneToken(`refreshAppToken:${decoded.user}`);
      const rtoken = response.Items.length > 0 ? response.Items[0].refresher : 'null';

      if (rtoken !== refreshtoken) {
        return {
          message: "Can't refresh. Invalid Token.",
          refreshed: false,
        };
      }
      const user = await findOneUserName(decoded.user);
      // console.log("findOneUser", user);
      const token = generateAccessToken(decoded.user, user.Items[0].email, user.Items[0].isAdmin, user.Items[0].id);
      const refreshToken = generateRefreshToken(decoded.user, user.Items[0].email, user.Items[0].isAdmin, user.Items[0].id);

      await addToListMobile(decoded.user, refreshToken);

      // await CreateActCookie(req, res, token);
      // await CreateRtCookie(req, res, refreshToken);

      const content = {
        user: decoded.user,
        email: user.Items[0].email,
        isAdmin: user.Items[0].isAdmin,
        id: user.Items[0].id,
        exp: user.Items[0].exp,
      };
      return {
        message: 'Token Refreshed',
        refreshed: true,
        content,
        JWT: token,
        refresh: refreshToken,
      };
    } catch (error) {
      return error.message;
      // console.log(error);
    }
  }
}

export async function verifyToken(token, res) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    return decoded;
  } catch {
    return res.status(405).send('Token is invalid');
  }
}
