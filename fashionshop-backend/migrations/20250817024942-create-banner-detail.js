'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banner_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      banner_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'banners',
          key:'id'
        }
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'products',
          key:'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.NOW
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('banner_details');
  }
};