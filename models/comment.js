'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ UserInfo, Post }) {
      this.belongsTo(UserInfo, { targetKey: 'User_id', foreignKey: 'User_id' });
      this.belongsTo(Post, { targetKey: 'post_id', foreignKey: 'Post_id' });
    }
  }
  Comment.init(
    {
      comment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      User_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      Post_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      comment: {
        allowNull: false,
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
      tableName: 'comments',
      modelName: 'Comment',
    },
  );
  return Comment;
};
