'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VariantValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VariantValue.belongsTo(models.Variant,{
        foreignKey: 'variant_id',
        as: 'variant'
      })
    }
  }
  VariantValue.init({
    variant_id: DataTypes.INTEGER,
    value: DataTypes.TEXT,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'VariantValue',
    tableName:'variant_values',
    underscored:true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return VariantValue;
};