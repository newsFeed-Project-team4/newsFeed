'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Post, Like, Comment }) {
      this.belongsTo(User, { targetKey: 'user_id', foreignKey: 'User_id' });
      this.hasMany(Post, { sourceKey: 'User_id', foreignKey: 'User_id' });
      this.hasMany(Like, { sourceKey: 'User_id', foreignKey: 'User_id' });
      this.hasMany(Comment, { sourceKey: 'User_id', foreignKey: 'User_id' });
    }
  }
  UserInfo.init(
    {
      user_info_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      User_id: {
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      one_line_introduction: {
        type: DataTypes.STRING,
      },
      pet_name: {
        type: DataTypes.STRING,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'user_infos',
      modelName: 'UserInfo',
    },
  );
  return UserInfo;
};
