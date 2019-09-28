const { generateRandomAlphanumString } = require("../src/crypto");

module.exports = (sequelize, DataTypes) => {
  const Meetup = sequelize.define(
    "meetup",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(128),
        defaultValue: () => generateRandomAlphanumString(10) //in hex 1 bytes equal 2 chars, i.e. for 16 chars we need 12 bytes
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT("long")
      },
      datetime: {
        type: DataTypes.DATE
      },
      maxTravelTime: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true,
      indexes: [{ type: "FULLTEXT", name: "text_idx", fields: ["description"] }]
    }
  );

  Meetup.associate = models => {
    Meetup.belongsTo(models.user, {
      as: "owner",
      constraints: false,
      allowNull: true,
      defaultValue: null
    });
    Meetup.belongsToMany(models.user, {
      through: models.meetupUsers,
      foreignKey: "meetupId",
      otherKey: "userId"
    }); //members
    Meetup.hasMany(models.event);
    Meetup.belongsToMany(models.eventCategory, {
      through: "meetupCategory",
      foreignKey: "meetupId",
      otherKey: "eventCategoryId"
    });
  };

  Meetup.afterAssociation = db => {};

  return Meetup;
};
