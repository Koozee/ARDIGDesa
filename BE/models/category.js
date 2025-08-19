const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_kategori: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  deskripsi: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true
});

module.exports = Category;