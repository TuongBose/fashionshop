'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Brand, {
        foreignKey: 'brand_id'
      });
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id'
      });

      Product.hasMany(models.OrderDetail, {
        foreignKey: 'product_id'
      });
      Product.hasMany(models.BannerDetail, {
        foreignKey: 'product_id'
      });
      Product.hasMany(models.Feedback, {
        foreignKey: 'product_id'
      });
      Product.hasMany(models.NewsDetail, {
        foreignKey: 'product_id'
      });
      Product.hasMany(models.ProductImage, {
        foreignKey: 'product_id',
        as: 'product_images'
      });
      Product.hasMany(models.ProductAttributeValue, {
        foreignKey: 'product_id',
        as:'product_attribute_values'
      });
      Product.hasMany(models.ProductVariantValue, {
        foreignKey: 'product_id',
        as:'product_variant_values'
      });
    }
  }
  Product.init({
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      oldprice: DataTypes.INTEGER,
      image: DataTypes.TEXT,
      description: DataTypes.TEXT,
      specification: DataTypes.TEXT,
      buyturn: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      brand_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER
    }, {
      sequelize,
      modelName: 'Product',
      tableName:'products',
      underscored:true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Product;
};