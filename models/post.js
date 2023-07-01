'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ UserInfo, Comment, Like }) {
      this.belongsTo(UserInfo, {
        targetKey: 'User_id',
        foreignKey: 'User_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      this.hasMany(Comment, {
        sourceKey: 'post_id',
        foreignKey: 'Post_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      this.hasMany(Like, {
        sourceKey: 'post_id',
        foreignKey: 'Post_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Post.init(
    {
      post_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      User_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      content: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      Name: {
        allowNull: false,
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
      tableName: 'posts',
      modelName: 'Post',
    },
  );
  return Post;
};
