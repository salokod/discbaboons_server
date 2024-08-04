import jwt from "jsonwebtoken";

// middleware/auth.js
export const isAuthenticated = (req, res, next) => {
  // This is a placeholder for authentication logic.
  // In a real-world application, you would check if the user is authenticated here.

  const baboonActToken = req.body.token;
  try {
    const decoded = jwt.verify(baboonActToken, process.env.SECRET_TOKEN);
    if (decoded) {
      req.jwt = decoded;
      next();
    }
  } catch {
    return res.status(401).json({ message: "Baboon not logged in" });
  }
};
