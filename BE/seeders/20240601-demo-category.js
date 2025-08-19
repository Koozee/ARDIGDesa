"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('categories', [
      {
        nama_kategori: 'Kependudukan',
        deskripsi: 'Kategori untuk dokumen kependudukan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kategori: 'Keuangan',
        deskripsi: 'Kategori untuk dokumen keuangan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kategori: 'Umum',
        deskripsi: 'Kategori untuk dokumen umum',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kategori: 'Lainnya',
        deskripsi: 'Kategori untuk dokumen lainnya',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  }
};
