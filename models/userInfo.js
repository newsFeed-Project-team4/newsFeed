'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Post }) {
      this.belongsTo(User, {
        targetKey: 'userId',
        foreignKey: 'UserId',
      });
      // this.hasMany(Post, {
      //   sourceKey: 'name',
      //   foreignKey: 'Name',
      // });
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
      tableName: 'usersInfos',
      modelName: 'userInfo',
    },
  );
  return UserInfo;
};
