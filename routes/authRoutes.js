const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const rateLimit = require("express-rate-limit");


const MAX_FAILED_ATTEMPTS = process.env.LOCKOUT_ATTEMPTS || 5;

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5,
  message: { message: "Too many login attempts. Try again later." }
});

router.use("/login", loginLimiter);

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (password.length < 5) return res.status(400).json({ message: "Password too short" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user.locked) {
      return res.status(403).json({ message: "Account locked due to multiple failed attempts" });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      user.failedAttempts += 1;

      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS - 1) {
        user.locked = true;
      }

      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.failedAttempts = 0;
    user.locked = false;
    const token = user.generateAuthToken();
    await user.save();
    res.json({ token });
  } catch (error) {
    console.log('error :>> ', error);
  }

});

router.post("/one-time-link", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const linkToken = user.generateOneTimeLink();
  await user.save();

  res.json({ link: `${process.env.SERVER_BASE_URL}/auth/verify/${linkToken}` });
});

router.get("/verify/:token", async (req, res) => {
  const user = await User.findOne({ "oneTimeLink.token": req.params.token });
  if (!user || user.oneTimeLink.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  const token = user.generateAuthToken();
  user.oneTimeLink = undefined;     // Remove one-time linkl from the db after use
  await user.save();

  res.json({ token });
});

// main get time controller
router.get("/time", authMiddleware, (req, res) => {
  res.json({ time: new Date().toISOString() });
});

module.exports = router;