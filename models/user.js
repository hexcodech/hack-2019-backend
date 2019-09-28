const { sendMail } = require("../src/email");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING(255),
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
      },
      real: {
        type: DataTypes.INTEGER(1) //boolean
      },
      locale: {
        type: DataTypes.STRING(5),
        default: "en-US",
        validate: {
          isIn: ["en-US", "de-CH", "de-DE"]
        }
      }
    },
    {
      freezeTableName: true
    }
  );

  User.associate = models => {
    User.belongsToMany(models.meetup, {
      through: models.meetupUsers,
      foreignKey: "userId",
      otherKey: "meetupId"
    }); //member/owner of
  };

  User.afterAssociation = db => {
    // User.fakeLogin = function(name, meetupId, locale = "en-US") {
    //   return this.findAll({ where: { name, meetupId, real: false } }).then(
    //     users => {
    //       if (!users || users.length === 0) {
    //         //create a user
    //         return this.create({ name, meetupId, locale, real: false });
    //       }

    //       if (users.length !== 1) {
    //         throw new Error(
    //           "Internal error! Two users apparently have the same name for the same event!"
    //         );
    //       }
    //       return users[0];
    //     }
    //   );
    // };

    User.login = function(name, email, locale) {
      return this.findAll({ where: { email, real: true } })
        .then(users => {
          if (!users || users.length === 0) {
            //the user first has to be registered
            return this.create({ name, email, locale, real: true });
          }

          if (users.length !== 1) {
            throw new Error(
              "Internal error! Two users apparently have the same email address"
            );
          }
          return users[0];
        })
        .then(user =>
          db.authenticationToken
            .create({
              userId: user.id
            })
            .then(authenticationToken => {
              //send email with authenticationToken.token

              return sendMail(email, "login", user.locale, {
                name: user.name,
                authenticationToken: authenticationToken.token
              });
            })
        );
    };
  };

  return User;
};
