"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "documents",
      [
        {
          judul: "Kartu Keluarga 2024",
          tipe_dokumen: "Kartu Keluarga",
          nomor_surat: "KK/2024/001",
          tanggal_dokumen: "2024-06-01",
          path_file: "archivedata/kk2024.pdf",
          metadata: JSON.stringify({ NoKK: "1234567890123456" }),
          userId: 1,
          categoryId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          judul: "Surat Keterangan Domisili",
          tipe_dokumen: "Surat Keterangan",
          nomor_surat: "SKD/2024/002",
          tanggal_dokumen: "2024-06-02",
          path_file: "archivedata/skd2024.pdf",
          metadata: JSON.stringify({}),
          userId: 2,
          categoryId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("documents", null, {});
  },
};
