'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
