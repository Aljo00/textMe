const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Check for token in both cookie and authorization header
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(401).redirect("/login");
  }
};

module.exports = authMiddleware;
