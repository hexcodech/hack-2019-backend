module.exports = (sequelize, DataTypes) => {
  const MeetupUsers = sequelize.define(
    "meetupUsers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      longitude: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      latitude: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      meansOfTransport: {
        type: DataTypes.STRING(255),
        default: "public_transport",
        validate: {
          isIn: [
            "public_transport",
            "cycling",
            "driving",
            "walking",
            "cycling+public_transport"
          ]
        }
      }
    },
    {
      freezeTableName: true
    }
  );

  MeetupUsers.associate = models => {
    MeetupUsers.belongsTo(models.user, {
      foreignKey: "userId"
    });
    MeetupUsers.belongsTo(models.meetup, {
      foreignKey: "meetupId"
    });
  };

  MeetupUsers.afterAssociation = db => { };

  return MeetupUsers;
};
