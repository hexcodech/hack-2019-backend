const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;

module.exports = db => {
  passport.use(
    new BearerStrategy((token, done) =>
      db.authenticationToken
        .findOne({ where: { token } })
        .then(token => token.getUser())
        .then(user =>
          done(null, user ? user : null, user ? { scope: "all" } : undefined)
        )
        .catch(e => done(e, null))
    )
  );

  return passport;
};
