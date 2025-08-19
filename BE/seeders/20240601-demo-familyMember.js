"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('family_members', [
      {
        nik: '1234567890123456',
        nama_lengkap: 'Budi Santoso',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '1990-01-15',
        jenis_kelamin: 'Laki-laki',
        status_hubungan: 'Kepala Keluarga',
        pendidikan_akhir: 'S1',
        agama: 'Islam',
        status: 'Menikah',
        pekerjaan: 'Pegawai Negeri',
        nama_ayah: 'Ahmad Santoso',
        nama_ibu: 'Siti Aminah',
        documentId: 1
      },
      {
        nik: '1234567890123457',
        nama_lengkap: 'Ani Santoso',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1992-03-20',
        jenis_kelamin: 'Perempuan',
        status_hubungan: 'Istri',
        pendidikan_akhir: 'S1',
        agama: 'Islam',
        status: 'Menikah',
        pekerjaan: 'Ibu Rumah Tangga',
        nama_ayah: 'Bambang Sutejo',
        nama_ibu: 'Rina Marlina',
        documentId: 1
      },
      {
        nik: '1234567890123458',
        nama_lengkap: 'Citra Santoso',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2015-07-10',
        jenis_kelamin: 'Perempuan',
        status_hubungan: 'Anak',
        pendidikan_akhir: 'SD',
        agama: 'Islam',
        status: 'Belum Menikah',
        pekerjaan: 'Pelajar',
        nama_ayah: 'Budi Santoso',
        nama_ibu: 'Ani Santoso',
        documentId: 1
      },
      {
        nik: '1234567890123459',
        nama_lengkap: 'Doni Santoso',
        tempat_lahir: 'Bandung',
        tanggal_lahir: '2018-11-25',
        jenis_kelamin: 'Laki-laki',
        status_hubungan: 'Anak',
        pendidikan_akhir: 'TK',
        agama: 'Islam',
        status: 'Belum Menikah',
        pekerjaan: 'Pelajar',
        nama_ayah: 'Budi Santoso',
        nama_ibu: 'Ani Santoso',
        documentId: 1
      },
      {
        nik: '1234567890123460',
        nama_lengkap: 'Siti Aminah',
        tempat_lahir: 'Solo',
        tanggal_lahir: '1965-05-12',
        jenis_kelamin: 'Perempuan',
        status_hubungan: 'Ibu',
        pendidikan_akhir: 'SMA',
        agama: 'Islam',
        status: 'Menikah',
        pekerjaan: 'Ibu Rumah Tangga',
        nama_ayah: 'Haji Abdul',
        nama_ibu: 'Hajjah Fatimah',
        documentId: 1
      },
      {
        nik: '1234567890123461',
        nama_lengkap: 'Ahmad Santoso',
        tempat_lahir: 'Solo',
        tanggal_lahir: '1960-08-30',
        jenis_kelamin: 'Laki-laki',
        status_hubungan: 'Ayah',
        pendidikan_akhir: 'SMA',
        agama: 'Islam',
        status: 'Menikah',
        pekerjaan: 'Wiraswasta',
        nama_ayah: 'Haji Santoso',
        nama_ibu: 'Hajjah Siti',
        documentId: 1
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('family_members', null, {});
  }
};
