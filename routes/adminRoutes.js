const express = require("express");
const User = require("..//models/UserModel");
const router = express.Router();

router.post("/kickout", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.tokens = [];
  user.locked = false;
  user.failedAttempts = 0;
  await user.save();

  res.json({ message: "User kicked out" });
});

module.exports = router;