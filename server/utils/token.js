const jwt = require("jsonwebtoken");

const TOKEN_TTL = "2h";
const REFRESH_TTL = "7d";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_TTL });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TTL });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
};

