const jwt = require("jsonwebtoken");

const guestMiddleware = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      // If token exists and is valid, redirect to dashboard
      jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      return res.redirect("/dashboard");
    }
    next();
  } catch (error) {
    // If token is invalid, clear it and continue
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    next();
  }
};

module.exports = guestMiddleware;
