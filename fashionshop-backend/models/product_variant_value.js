'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductVariantValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductVariantValue.belongsTo(models.Product,{
        foreignKey: 'product_id',
      })
    }
  }
  ProductVariantValue.init({
    product_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    old_price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    sku: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ProductVariantValue',
    tableName:'product_variant_values',
    underscored:true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return ProductVariantValue;
};