const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokens: [{ type: String }],
  locked: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  oneTimeLink: {
    token: { type: String },
    expiresAt: { type: Date },
  },
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  this.tokens.push(token);
  return token;
};

UserSchema.methods.generateOneTimeLink = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.oneTimeLink = { token, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
  return token;
};

module.exports = mongoose.model("User", UserSchema);