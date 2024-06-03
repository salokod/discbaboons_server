import Cookies from "cookies";

export const CreateActCookie = async (req, res, actJwt) => {
  const cookies = new Cookies(req, res, {
    secure: process.env.ENVIRONMENT === "prod" ? true : false,
  });

  const cookieOption = {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    secure: process.env.ENVIRONMENT === "prod" ? true : false,
    sameSite: true,
  };

  cookies.set("_baboon_act", actJwt, cookieOption);
};

export const CreateRtCookie = async (req, res, actJwt) => {
  const cookies = new Cookies(req, res, {
    secure: process.env.ENVIRONMENT === "prod" ? true : false,
  });

  const cookieOption = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    secure: process.env.ENVIRONMENT === "prod" ? true : false,
    sameSite: true,
  };

  cookies.set("_baboon_rt", actJwt, cookieOption);
};
