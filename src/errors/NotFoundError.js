class NotFoundError extends Error {
  constructor(locale) {
    super("The given resource wasn't found!");
    this.code = 404;
  }
}

module.exports = NotFoundError;
