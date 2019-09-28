class InsufficientArgumentsError extends Error {
  constructor(locale) {
    super("The argument requirements weren't met!");
    this.code = 412; //Precondition Failed
  }
}

module.exports = InsufficientArgumentsError;
