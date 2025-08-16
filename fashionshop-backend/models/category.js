'use strict';
const {
  Model
} = require('sequelize');
const { underscoredIf } = require('sequelize/lib/utils');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    name: DataTypes.STRING,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Category',
    tableName:'categories',
    underscored:true,
  });
  return Category;
};