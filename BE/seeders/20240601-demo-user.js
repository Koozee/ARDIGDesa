'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash password sebelum insert
    const passwordHash = await bcrypt.hash('12345', 10);

    return queryInterface.bulkInsert('users', [
      {
        username: 'Koozee',
        password: passwordHash,
        nama_lengkap: 'Koozee',
        jabatan: 'Sekdes',
        nomor_telepon: '081234567890',
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'BudiSantoso',
        password: passwordHash,
        nama_lengkap: 'Budi Santoso',
        nomor_telepon: '081234567890',
        role:'user',
        jabatan: 'Staff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};