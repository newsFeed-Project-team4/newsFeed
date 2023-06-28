'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tokens', {
      token_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      User_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },
  timestamp: false,
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tokens');
  },
};
