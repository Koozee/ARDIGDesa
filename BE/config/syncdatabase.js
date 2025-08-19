// Import koneksi sequelize
const sequelize = require('./database');

// Import semua model dan asosiasinya
require('../models'); // Cukup import file index.js di folder models

// Fungsi untuk melakukan sinkronisasi
async function syncDatabase() {
  try {
    // Perintah sync() akan membaca semua model dan membuat tabelnya jika belum ada.
    // { force: true } akan menghapus tabel lama dan membuat yang baru (HATI-HATI!)
    // Gunakan { alter: true } untuk pengembangan agar mencoba mencocokkan tabel yang ada.
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database & tables created successfully!');
  } catch (error) {
    console.error('Unable to sync database:', error);
  } finally {
    // Tutup koneksi setelah selesai
    await sequelize.close();
  }
}

// Jalankan fungsi
syncDatabase();