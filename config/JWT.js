const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isOnline: user.isOnline,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "2d" }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
