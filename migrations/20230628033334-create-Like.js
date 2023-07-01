'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      like_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      User_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'user_infos',
          key: 'User_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      Post_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'posts',
          key: 'post_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  timestamp: false,
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  },
};
