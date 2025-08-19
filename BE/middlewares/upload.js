const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi Penyimpanan File (DiskStorage)
const fileStorage = multer.diskStorage({
  // Menentukan folder tujuan penyimpanan file
  destination: (req, file, cb) => {
    const uploadPath = 'archivedata/';
    // Membuat folder 'archivedata' jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  // Menentukan nama file yang akan disimpan agar unik
  filename: (req, file, cb) => {
    // Format: WaktuSaatIni-NamaAsliFile.extension
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Konfigurasi Filter File (FileFilter)
const fileFilter = (req, file, cb) => {
  // Tentukan tipe file yang diizinkan
  const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Izinkan file jika tipenya sesuai
    cb(null, true);
  } else {
    // Tolak file jika tipenya tidak sesuai
    cb(new Error('Tipe file tidak diizinkan! Hanya PNG, JPG, JPEG, PDF, DOCX, dan XLSX.'), false);
  }
};

// Inisialisasi Multer dengan konfigurasi di atas
const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file: 5 MB
  }
});

module.exports = upload;