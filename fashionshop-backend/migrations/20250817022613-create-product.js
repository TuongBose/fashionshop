'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      oldprice: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      specification: {
        type: Sequelize.TEXT
      },
      buyturn: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'brands',
          key:'id'
        }
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'categories',
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
    await queryInterface.dropTable('products');
  }
};