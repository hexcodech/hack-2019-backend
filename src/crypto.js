const crypto = require("crypto");
const HASH_ALGORITHM = "sha512";

module.exports.generateRandomString = bytes =>
  crypto.randomBytes(bytes).toString("base64");

module.exports.generateRandomAlphanumString = bytes =>
  crypto.randomBytes(bytes).toString("hex");

module.exports.generateHash = (data, salt = false) => {
  if (salt !== false) {
    //if 'false' is passed, no salt is applied
    //https://stackoverflow.com/questions/184112/what-is-the-optimal-length-for-user-password-salt
    salt = crypto.randomBytes(512 / 8).toString("base64");
  }

  const hmacOrHash = salt
    ? crypto.createHmac(algorithm, salt)
    : crypto.createHash(algorithm);

  hmacOrHash.update(data);

  return { hash: hmacOrHash.digest("hex"), salt, algorithm: HASH_ALGORITHM };
};
