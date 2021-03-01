'use strict';
module.exports = (sequelize, DataTypes) => {
  var Category = sequelize.define('Category', {
    category_name: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
        notEmpty: true,
        } 
    },
    category_description: { 
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
        notEmpty: true,
        } 
    }
    
  });

  Category.associate = function(models) {
    models.Category.belongsToMany(models.Document, {
      as: 'documents',
      through: 'documentCategories',
      foreignKey: 'category_id'
    });
  };

  return Category;
};