const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class FamilyMember extends Model {}

FamilyMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nik: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true,
    },
    nama_lengkap: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tempat_lahir: {
      type: DataTypes.STRING(50),
    },
    tanggal_lahir: {
      type: DataTypes.DATEONLY,
    },
    jenis_kelamin: {
      type: DataTypes.STRING(20),
    },
    status_hubungan: {
      type: DataTypes.STRING(50),
    },
    pendidikan_akhir: {
      type: DataTypes.STRING(50),
    },
    agama: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.STRING(50),
    },
    pekerjaan: {
      type: DataTypes.STRING(50),
    },
    nama_ayah: {
      type: DataTypes.STRING(50),
    },
    nama_ibu: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: "FamilyMember",
    tableName: "family_members",
    timestamps: false,
  }
);

module.exports = FamilyMember;
