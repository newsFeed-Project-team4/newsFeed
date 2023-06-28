'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate({ UserInfo, Post }) {
      this.belongsTo(UserInfo, { targetKey: 'userId', foreignKey: 'userId' });
      this.belongsTo(Post, { targetKey: 'postId', foreignKey: 'postId' });
    }
  }
  Like.init(
    {
      like_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'likes',
      modelName: 'Like',
    },
  );
  return Like;
};
