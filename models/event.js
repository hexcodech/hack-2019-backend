module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "event",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT("long")
      },
      latitude: {
        type: DataTypes.FLOAT
      },
      longitude: {
        type: DataTypes.FLOAT
      },
      start: {
        type: DataTypes.DATE
      },
      end: {
        type: DataTypes.DATE
      },
      price: {
        type: DataTypes.INTEGER
      },
      priceLevel: {
        type: DataTypes.INTEGER
      },
      rating: {
        type: DataTypes.INTEGER
      },
      placeId: {
        type: DataTypes.STRING
      }
    },
    {
      freezeTableName: true,
      indexes: [{ type: "FULLTEXT", name: "text_idx", fields: ["description"] }]
    }
  );

  Event.associate = models => {
    Event.belongsTo(models.meetup);
    Event.belongsToMany(models.eventCategory, {
      through: "eventEventCategory",
      foreignKey: "eventId",
      otherKey: "eventCategoryId"
    });
  };

  Event.afterAssociation = db => {};

  return Event;
};
