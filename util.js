const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const getPasswordHash = async (rawPassword) =>
  await bcrypt.hash(rawPassword, SALT_ROUNDS);

const checkPasswordHash = async (rawPassword, hash) =>
  await bcrypt.compare(rawPassword, hash);

module.exports = {
  getPasswordHash,
  checkPasswordHash,
};
