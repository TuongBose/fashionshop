'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'orders',
          key:'id'
        }
      },
      product_variant_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
          model: 'product_variant_values',
          key: 'id'
        },
      },
      price: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('order_details');
  }
};