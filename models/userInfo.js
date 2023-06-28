'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Like }) {
      this.belongsTo(User, { targetKey: 'userId', foreignKey: 'UserId' });
      this.hasMany(Like, { sourceKey: 'userId', foreignKey: 'UserId' });
    }
  }
  UserInfo.init(
    {
      UserId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      oneLiner: {
        type: DataTypes.STRING,
      },
      petName: {
        type: DataTypes.STRING,
      },
      imageUrl: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'userInfos',
      modelName: 'UserInfo',
    },
  );
  return UserInfo;
};
