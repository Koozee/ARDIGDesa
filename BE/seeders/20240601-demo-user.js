'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash password sebelum insert
    const passwordHash = await bcrypt.hash('Koozeedev', 10);

    return queryInterface.bulkInsert('users', [
      {
        username: 'Koozee',
        password: passwordHash,
        nama_lengkap: 'Niko',
        jabatan: 'Developer',
        nomor_telepon: '089673457965',
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'Budiblack',
        password: passwordHash,
        nama_lengkap: 'Budi Black',
        nomor_telepon: '081622457965',
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