module.exports = (sequelize, DataTypes) => {
  const EventCategory = sequelize.define(
    "eventCategory",
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
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      }
    },
    {
      freezeTableName: true
    }
  );

  EventCategory.associate = models => {
    EventCategory.hasMany(models.event);
  };

  EventCategory.afterAssociation = db => {};

  return EventCategory;
};
