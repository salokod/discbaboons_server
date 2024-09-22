import jwt from 'jsonwebtoken';

// middleware/auth.js
export const isAuthenticated = (req, res, next) => {
  // This is a placeholder for authentication logic.
  // In a real-world application, you would check if the user is authenticated here.
  function parseBearerToken(bearerToken) {
    if (typeof bearerToken !== 'string') {
      throw new Error('Invalid token format');
    }
    const parts = bearerToken.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid token format');
    }
    return parts[1];
  }
  try {
    const baboonActToken = parseBearerToken(req.headers.authorization);

    const decoded = jwt.verify(baboonActToken, process.env.SECRET_TOKEN);
    if (decoded) {
      req.jwt = decoded;
      next();
    }
  } catch {
    return res.status(401).json({ message: 'Baboon not logged in' });
  }
};
