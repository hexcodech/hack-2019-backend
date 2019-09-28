const { generateRandomAlphanumString } = require("../src/crypto");

module.exports = (sequelize, DataTypes) => {
  const AuthenticationToken = sequelize.define(
    "authenticationToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(128),
        defaultValue: () => generateRandomAlphanumString(64) //in hex 1 bytes equal 2 chars, i.e. for 16 chars we need 12 bytes
      }
      /**
       * createdAt
       * updatedAt are created automatically
       */
    },
    {
      freezeTableName: true
    }
  );

  AuthenticationToken.associate = models => {
    AuthenticationToken.belongsTo(models.user);
  };

  AuthenticationToken.afterAssociation = db => {};

  return AuthenticationToken;
};
