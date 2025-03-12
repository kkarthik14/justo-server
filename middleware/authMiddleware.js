const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

module.exports = async (req, res, next) => {
  const bearerToken = req.header("Authorization");
  const token = bearerToken.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log(user, "user");
    if (!user || !user.tokens.includes(token)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};