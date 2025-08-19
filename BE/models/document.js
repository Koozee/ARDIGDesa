const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nomor_surat: {
    type: DataTypes.STRING(100)
  },
  tipe_dokumen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tanggal_dokumen: {
    type: DataTypes.DATEONLY // Hanya menyimpan tanggal, tanpa waktu
  },
  path_file: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON // Sequelize akan otomatis handle JSON
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;