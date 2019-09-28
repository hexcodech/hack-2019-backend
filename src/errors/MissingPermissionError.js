class MissingPermissionError extends Error {
  constructor(locale) {
    super("You aren't allowed to do this!");
    this.code = 403;
  }
}

module.exports = MissingPermissionError;
