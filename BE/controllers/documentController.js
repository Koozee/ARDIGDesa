const sequelize = require("../config/database");
const { Op } = require("sequelize");
const { Document, User, Category, FamilyMember } = require("../models");
const fs = require("fs");
const Tesseract = require("tesseract.js"); // <-- IMPORT TESSERACT

// Helper function untuk parsing teks mentah dari OCR KK
const parseKKData = (text) => {
  const extractedData = {
    rincian_dokumen: {},
    anggota_keluarga: [],
  };

  try {
    // Pola Regex untuk mengambil data header
    // Nomor KK: cari dengan beberapa pendekatan (label "No.", label "Nomor KK", dan dekat header KARTU KELUARGA)
    const noByNoLabelRegex = /\bNo\.?\s*[:\-]?\s*([0-9][0-9\s]{14,}[0-9])/i;
    const noByNomorLabelRegex =
      /(?:Nomor\s*KK|Nomor\s*Kartu\s*Keluarga)\s*[:\-]?\s*([0-9][0-9\s]{14,}[0-9])/i;
    const alamatRegex =
      /Alamat\s*:?\s*([^\n\r]*?)(?=\s*(RT|RW|Desa|Kelurahan|Kecamatan)\b|\n|\r|$)/i;

    // Perketat agar tidak menangkap "Keluarga" dari "Kartu Keluarga"
    const desaRegex =
      /(?:Desa\s*\/\s*Kelurahan|Kelurahan|Desa|Kel\.)\s*:?\s*([^\n\r]+)/i;
    const kecamatanRegex = /Kecamatan\s*:?\s*([^\n\r]+)/i;

    // Ekstraksi data header
    // Ekstraksi Nomor KK dengan beberapa strategi
    const normalizeDigits = (s) => (s || "").replace(/\D/g, "");
    let nomorKK = null;
    const noByNoLabelMatch = text.match(noByNoLabelRegex);
    if (noByNoLabelMatch) {
      const digits = normalizeDigits(noByNoLabelMatch[1]);
      if (digits.length === 16) nomorKK = digits;
    }
    if (!nomorKK) {
      const noByNomorLabelMatch = text.match(noByNomorLabelRegex);
      if (noByNomorLabelMatch) {
        const digits = normalizeDigits(noByNomorLabelMatch[1]);
        if (digits.length === 16) nomorKK = digits;
      }
    }
    if (!nomorKK) {
      const headerIndex = text.search(/KARTU\s+KELUARGA/i);
      if (headerIndex >= 0) {
        const windowText = text.substring(
          headerIndex,
          Math.min(text.length, headerIndex + 300)
        );
        const nearHeaderMatch = windowText.match(/([0-9][0-9\s]{14,}[0-9])/);
        if (nearHeaderMatch) {
          const digits = normalizeDigits(nearHeaderMatch[1]);
          if (digits.length === 16) nomorKK = digits;
        }
      }
    }
    if (nomorKK) extractedData.rincian_dokumen.nomorkk = nomorKK;

    const alamatMatch = text.match(alamatRegex);
    if (alamatMatch)
      extractedData.rincian_dokumen.alamat = alamatMatch[1].trim();

    // Ekstraksi Desa/Kelurahan dan Kecamatan
    const desaMatch = text.match(desaRegex);
    if (desaMatch)
      extractedData.rincian_dokumen.kelurahan = desaMatch[1].trim();

    const kecamatanMatch = text.match(kecamatanRegex);
    if (kecamatanMatch)
      extractedData.rincian_dokumen.kecamatan = kecamatanMatch[1].trim();
  } catch (err) {
    console.error("Error saat parsing teks OCR:", err);
  }

  return extractedData;
};

// Helper function untuk parsing teks mentah dari OCR KTP
const parseKTPData = (text) => {
  const extractedData = {
    rincian_dokumen: {},
    anggota_keluarga: [],
  };

  try {
    // NIK (16 digit) - lebih robust
    const nikRegex = /NIK\s*:?\s*([0-9]{16})/i;

    // Nama Lengkap - lebih robust
    const namaRegex = /Nama\s*:?\s*([A-Z\s]+)/i;

    // Tempat/Tanggal Lahir - lebih robust untuk variasi OCR
    const ttlRegex = /(?:TempayTgi|Tempat\/Tgl|TTL)\s+Lahir\s*:?\s*([^,]+),\s*([0-9]{1,2}\s*[-/]\s*[0-9]{1,2}\s*[-/]\s*[0-9]{4})/i;

    // Jenis Kelamin - lebih robust
    const jkRegex = /(?:Jenis\s+Kelamin|JK)\s*:?\s*(LAKI-LAKI|PEREMPUAN|L|P)/i;

    // Alamat - lebih robust
    const alamatRegex = /(?:Alamat|Alm)\s*:?\s*([^\n\r]+)/i;

    // RT/RW - lebih robust
    const rtRwRegex = /(?:RT\/RW|RT|RW)\s*:?\s*([0-9]{1,3}\/?[0-9]{1,3})/i;

    // Kelurahan/Desa - lebih robust
    const kelurahanRegex = /(?:Kel\/Desa|Kelurahan|Desa)\s*:?\s*([^\n\r]+)/i;

    // Kecamatan - lebih robust
    const kecamatanRegex = /(?:Kecamatan|Kec)\s*:?\s*([^\n\r]+)/i;

    // Agama - lebih robust
    const agamaRegex = /Agama\s*:?\s*([^\n\r]+)/i;

    // Status Perkawinan - lebih robust
    const statusRegex = /(?:Status\s+Perkawinan|Status)\s*:?\s*([^\n\r]+)/i;

    // Pekerjaan - lebih robust
    const pekerjaanRegex = /(?:Pekerjaan|Pkj)\s*:?\s*([^\n\r]+)/i;

    // Kewarganegaraan - lebih robust
    const wargaRegex = /(?:Kewarganegaraan|WN)\s*:?\s*([^\n\r]+)/i;

    // Berlaku Hingga - lebih robust
    const berlakuRegex = /(?:Berlaku\s+Hingga|Berlaku)\s*:?\s*([^\n\r]+)/i;

    // Ekstraksi data dengan logging detail
    const nikMatch = text.match(nikRegex);
    if (nikMatch) {
      extractedData.rincian_dokumen.nik = nikMatch[1];
      console.log("✅ NIK ditemukan:", nikMatch[1]);
    } else {
      console.log("❌ NIK tidak ditemukan");
    }

    const namaMatch = text.match(namaRegex);
    if (namaMatch) {
      const nama = namaMatch[1].trim();
      if (!nama.includes("PROVINSI") && !nama.includes("KABUPATEN") && !nama.includes("NIK")) {
        extractedData.rincian_dokumen.nama_lengkap = nama;
        console.log("✅ Nama ditemukan:", nama);
      } else {
        console.log("❌ Nama tidak valid (mengandung kata kunci lain):", nama);
      }
    } else {
      console.log("❌ Nama tidak ditemukan");
    }

    const ttlMatch = text.match(ttlRegex);
    if (ttlMatch) {
      const tempatLahir = ttlMatch[1].trim();
      const tanggalLahir = ttlMatch[2].trim();
      if (!tempatLahir.includes("PROVINSI") && !tempatLahir.includes("KABUPATEN") && !tempatLahir.includes("NIK")) {
        extractedData.rincian_dokumen.tempat_lahir = tempatLahir;
        extractedData.rincian_dokumen.tanggal_lahir = tanggalLahir;
        console.log("✅ TTL ditemukan:", tempatLahir, tanggalLahir);
      } else {
        console.log("❌ TTL tidak valid (tempat lahir mengandung kata kunci lain):", tempatLahir);
      }
    } else {
      console.log("❌ TTL tidak ditemukan");
    }

    const jkMatch = text.match(jkRegex);
    if (jkMatch) {
      extractedData.rincian_dokumen.jenis_kelamin = jkMatch[1];
      console.log("✅ Jenis Kelamin ditemukan:", jkMatch[1]);
    } else {
      console.log("❌ Jenis Kelamin tidak ditemukan");
    }

    const alamatMatch = text.match(alamatRegex);
    if (alamatMatch) {
      const alamat = alamatMatch[1].trim();
      // Validasi: alamat tidak boleh mengandung kata kunci lain
      if (!alamat.includes("PROVINSI") && !alamat.includes("KABUPATEN") && !alamat.includes("NIK")) {
        extractedData.rincian_dokumen.alamat = alamat;
        console.log("✅ Alamat ditemukan:", alamat);
      } else {
        console.log("❌ Alamat tidak valid (mengandung kata kunci lain):", alamat);
      }
    } else {
      console.log("❌ Alamat tidak ditemukan");
    }

    const rtRwMatch = text.match(rtRwRegex);
    if (rtRwMatch) {
      extractedData.rincian_dokumen.rt_rw = rtRwMatch[1];
      console.log("✅ RT/RW ditemukan:", rtRwMatch[1]);
    } else {
      console.log("❌ RT/RW tidak ditemukan");
    }

    const kelurahanMatch = text.match(kelurahanRegex);
    if (kelurahanMatch) {
      const kelurahan = kelurahanMatch[1].trim();
      if (!kelurahan.includes("PROVINSI") && !kelurahan.includes("KABUPATEN") && !kelurahan.includes("NIK")) {
        extractedData.rincian_dokumen.kelurahan = kelurahan;
        console.log("✅ Kelurahan ditemukan:", kelurahan);
      } else {
        console.log("❌ Kelurahan tidak valid (mengandung kata kunci lain):", kelurahan);
      }
    } else {
      console.log("❌ Kelurahan tidak ditemukan");
    }

    const kecamatanMatch = text.match(kecamatanRegex);
    if (kecamatanMatch) {
      const kecamatan = kecamatanMatch[1].trim();
      if (!kecamatan.includes("PROVINSI") && !kecamatan.includes("KABUPATEN") && !kecamatan.includes("NIK")) {
        extractedData.rincian_dokumen.kecamatan = kecamatan;
        console.log("✅ Kecamatan ditemukan:", kecamatan);
      } else {
        console.log("❌ Kecamatan tidak valid (mengandung kata kunci lain):", kecamatan);
      }
    } else {
      console.log("❌ Kecamatan tidak ditemukan");
    }

    const agamaMatch = text.match(agamaRegex);
    if (agamaMatch) {
      const agama = agamaMatch[1].trim();
      if (!agama.includes("PROVINSI") && !agama.includes("KABUPATEN") && !agama.includes("NIK")) {
        extractedData.rincian_dokumen.agama = agama;
        console.log("✅ Agama ditemukan:", agama);
      } else {
        console.log("❌ Agama tidak valid (mengandung kata kunci lain):", agama);
      }
    } else {
      console.log("❌ Agama tidak ditemukan");
    }

    const statusMatch = text.match(statusRegex);
    if (statusMatch) {
      const status = statusMatch[1].trim();
      if (!status.includes("PROVINSI") && !status.includes("KABUPATEN") && !status.includes("NIK")) {
        extractedData.rincian_dokumen.status_perkawinan = status;
        console.log("✅ Status Perkawinan ditemukan:", status);
      } else {
        console.log("❌ Status Perkawinan tidak valid (mengandung kata kunci lain):", status);
      }
    } else {
      console.log("❌ Status Perkawinan tidak ditemukan");
    }

    const pekerjaanMatch = text.match(pekerjaanRegex);
    if (pekerjaanMatch) {
      const pekerjaan = pekerjaanMatch[1].trim();
      if (!pekerjaan.includes("PROVINSI") && !pekerjaan.includes("KABUPATEN") && !pekerjaan.includes("NIK")) {
        extractedData.rincian_dokumen.pekerjaan = pekerjaan;
        console.log("✅ Pekerjaan ditemukan:", pekerjaan);
      } else {
        console.log("❌ Pekerjaan tidak valid (mengandung kata kunci lain):", pekerjaan);
      }
    } else {
      console.log("❌ Pekerjaan tidak ditemukan");
    }

    const wargaMatch = text.match(wargaRegex);
    if (wargaMatch) {
      const warga = wargaMatch[1].trim();
      if (!warga.includes("PROVINSI") && !warga.includes("KABUPATEN") && !warga.includes("NIK")) {
        extractedData.rincian_dokumen.kewarganegaraan = warga;
        console.log("✅ Kewarganegaraan ditemukan:", warga);
      } else {
        console.log("❌ Kewarganegaraan tidak valid (mengandung kata kunci lain):", warga);
      }
    } else {
      console.log("❌ Kewarganegaraan tidak ditemukan");
    }

    const berlakuMatch = text.match(berlakuRegex);
    if (berlakuMatch) {
      const berlaku = berlakuMatch[1].trim();
      if (!berlaku.includes("PROVINSI") && !berlaku.includes("KABUPATEN") && !berlaku.includes("NIK")) {
        extractedData.rincian_dokumen.berlaku_hingga = berlaku;
        console.log("✅ Berlaku Hingga ditemukan:", berlaku);
      } else {
        console.log("❌ Berlaku Hingga tidak valid (mengandung kata kunci lain):", berlaku);
      }
    } else {
      console.log("❌ Berlaku Hingga tidak ditemukan");
    }
  } catch (err) {
    console.error("Error saat parsing KTP:", err);
  }

  return extractedData;
};

// Fungsi parsing untuk dokumen yang tidak dikenal (hanya ekstrak data umum)

// Fungsi parsing untuk dokumen yang tidak dikenal (hanya ekstrak data umum)



// Fungsi parsing universal berdasarkan jenis dokumen dari frontend
const parseDocumentData = (text, documentType) => {
  const extractedData = {
    rincian_dokumen: {},
    anggota_keluarga: [],
  };

  try {
    // Parsing berdasarkan jenis dokumen dari frontend
    if (documentType === "Kartu Keluarga") {
      return parseKKData(text);
    } else if (documentType === "Kartu Tanda Penduduk") {
      return parseKTPData(text);
    } else {
      // Untuk dokumen lain, kembalikan data kosong
      console.log("Jenis dokumen tidak didukung untuk parsing:", documentType);
      return extractedData;
    }
  } catch (err) {
    console.error("Error saat parsing dokumen:", err);
    return extractedData;
  }
};

// Obyek untuk menampung semua fungsi controller
const documentController = {
  // FUNGSI BARU UNTUK OCR
  scanDocument: async (req, res) => {
    // Pastikan ada file yang diunggah
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah!" });
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB dalam bytes
    console.log("OCR - File size:", req.file.size, "Max size:", maxFileSize);
    if (req.file.size > maxFileSize) {
      console.log("OCR - File terlalu besar, menghapus file...");
      // Hapus file yang terlalu besar
      try {
        fs.unlinkSync(req.file.path);
        console.log("OCR - File berhasil dihapus");
      } catch (err) {
        console.error("OCR - Gagal menghapus file yang terlalu besar:", err.message);
      }
      console.log("OCR - Mengirim error response: Ukuran file terlalu besar");
      return res.status(400).json({
        message: "Ukuran file terlalu besar! Maksimal 5MB.",
      });
    }

    const filePath = req.file.path;

    try {
      console.log(`Memulai proses OCR untuk file: ${filePath}`);

      // Menjalankan Tesseract OCR pada file gambar
      const result = await Tesseract.recognize(filePath, "ind"); // 'ind' untuk Bahasa Indonesia

      console.log("Teks mentah hasil OCR berhasil didapat.");
      console.log("Teks mentah:", result.data.text);

      // Ambil jenis dokumen dari frontend
      const docType = req.body.docType || "";
      console.log("Jenis dokumen dari frontend:", docType);

      // Validasi jenis dokumen
      if (!docType) {
        return res.status(400).json({ 
          message: "Jenis dokumen harus dipilih untuk scan OCR." 
        });
      }

      // Mem-parsing teks mentah berdasarkan jenis dokumen dari frontend
      const extractedData = parseDocumentData(result.data.text, docType);
      console.log("Data hasil parsing:", extractedData);

      // Kirim data hasil parsing ke frontend (hanya rincian_dokumen tanpa anggota_keluarga)
      const isDebug =
        String(req.query.debug || "").toLowerCase() === "true" ||
        req.query.debug === "1";
      const responsePayload = {
        message: "File berhasil dipindai!",
        data: {
          rincian_dokumen: extractedData.rincian_dokumen,
        },
      };
      if (
        isDebug &&
        result &&
        result.data &&
        typeof result.data.text === "string"
      ) {
        responsePayload.debug = {
          textSnippet: result.data.text.slice(0, 1200),
          textLength: result.data.text.length,
        };
      }
      res.status(200).json(responsePayload);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat proses OCR",
        error: error.message,
      });
    } finally {
      // Selalu hapus file sementara setelah selesai diproses
      fs.unlinkSync(filePath);
      console.log(`File sementara ${filePath} berhasil dihapus.`);
    }
  },

  // 1. CREATE: Membuat dokumen baru (termasuk anggota keluarga jika ada)
  createDocument: async (req, res) => {
    const t = await sequelize.transaction();
    if (!req.file) {
      return res.status(400).json({ message: "File dokumen wajib diunggah!" });
    }

    // Validasi ukuran file (maksimal 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB dalam bytes
    console.log("Upload - File size:", req.file.size, "Max size:", maxFileSize);
    if (req.file.size > maxFileSize) {
      console.log("Upload - File terlalu besar, menghapus file...");
      // Hapus file yang terlalu besar
      try {
        fs.unlinkSync(req.file.path);
        console.log("Upload - File berhasil dihapus");
      } catch (err) {
        console.error("Upload - Gagal menghapus file yang terlalu besar:", err.message);
      }
      console.log("Upload - Mengirim error response: Ukuran file terlalu besar");
      return res.status(400).json({
        message: "Ukuran file terlalu besar! Maksimal 5MB.",
      });
    }

    try {
      let {
        judul,
        nomor_surat,
        tanggal_dokumen,
        userId,
        categoryId,
        tipe_dokumen,
        rincian_dokumen,
        anggota_keluarga,
      } = req.body;

      // Parsing jika masih string
      if (typeof rincian_dokumen === "string") {
        rincian_dokumen = JSON.parse(rincian_dokumen);
      }
      if (typeof anggota_keluarga === "string") {
        anggota_keluarga = JSON.parse(anggota_keluarga);
      }
      const path_file = req.file ? req.file.path : null; // Asumsi path file dari multer

      // Langkah 1: Buat entri di tabel documents
      const newDocument = await Document.create(
        {
          judul,
          nomor_surat,
          tanggal_dokumen,
          tipe_dokumen,
          path_file: path_file,
          rincian_dokumen, // Ini adalah objek JSON
          userId,
          categoryId,
        },
        { transaction: t }
      );

      // Langkah 2: Jika ada data anggota_keluarga (untuk KK), simpan ke tabel family_members
      if (anggota_keluarga && anggota_keluarga.length > 0) {
        // Tambahkan documentId ke setiap anggota keluarga
        const membersData = anggota_keluarga.map((member) => ({
          ...member,
          documentId: newDocument.id, // Hubungkan dengan ID dokumen yang baru dibuat
        }));

        // Simpan semua anggota keluarga secara massal
        await FamilyMember.bulkCreate(membersData, { transaction: t });
      }

      // Jika semua berhasil, commit transaksi
      await t.commit();

      res.status(201).json({
        message: "Dokumen berhasil dibuat dan diarsipkan!",
        data: newDocument,
      });
    } catch (error) {
      // Jika ada satu saja error, batalkan semua proses (rollback)
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      await t.rollback();
      res.status(500).json({
        message: "Gagal membuat dokumen",
        error: error.message,
      });
    }
  },

  // 2. READ: Mengambil semua dokumen
  getAllDocuments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        searchJudul = "",
        searchNomor = "",
        tanggal = "",
      } = req.query;

      const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
      const numericPage = Math.max(parseInt(page, 10) || 1, 1);
      const offset = (numericPage - 1) * numericLimit;

      const whereClause = { [Op.and]: [] };
      if (searchJudul) {
        whereClause[Op.and].push({ judul: { [Op.like]: `%${searchJudul}%` } });
      }
      if (searchNomor) {
        whereClause[Op.and].push({
          nomor_surat: { [Op.like]: `%${searchNomor}%` },
        });
      }
      if (tanggal) {
        whereClause[Op.and].push({ tanggal_dokumen: tanggal });
      }
      if (whereClause[Op.and].length === 0) delete whereClause[Op.and];

      const total = await Document.count({ where: whereClause });
      const documents = await Document.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        offset,
        limit: numericLimit,
        include: [
          { model: User, attributes: ["id", "nama_lengkap"] },
          { model: Category, attributes: ["id", "nama_kategori"] },
        ],
      });

      return res.status(200).json({
        data: documents,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          total,
          totalPages: Math.ceil(total / numericLimit) || 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil data dokumen",
        error: error.message,
      });
    }
  },

  // 3. READ: Mengambil satu dokumen spesifik berdasarkan ID
  getDocumentById: async (req, res) => {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id, {
        include: [
          // Sertakan semua data terkait
          { model: User, attributes: ["id", "nama_lengkap"] },
          { model: Category, attributes: ["id", "nama_kategori"] },
          { model: FamilyMember }, // Ambil semua data anggota keluarga yang terhubung
        ],
      });

      if (!document) {
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil detail dokumen",
        error: error.message,
      });
    }
  },

  // 4. UPDATE: Memperbarui rincian_dokumen dokumen
  updateDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        judul,
        nomor_surat,
        tanggal_dokumen,
        categoryId,
        rincian_dokumen,
        tipe_dokumen,
      } = req.body;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      // Lakukan update
      await document.update({
        judul,
        nomor_surat,
        tanggal_dokumen,
        tipe_dokumen,
        categoryId,
        rincian_dokumen,
      });

      res
        .status(200)
        .json({ message: "Dokumen berhasil diperbarui", data: document });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal memperbarui dokumen", error: error.message });
    }
  },

  /**
   * 5. DELETE: Menghapus dokumen
   * 
   * Fungsi ini akan:
   * 1. Menghapus data family_members jika dokumen adalah Kartu Keluarga
   * 2. Menghapus dokumen dari database
   * 3. Menghapus file fisik dari server
   * 
   * Menggunakan transaksi database untuk menjaga konsistensi data
   * 
   * @param {Object} req - Request object dengan params.id
   * @param {Object} res - Response object
   * @returns {Object} Response dengan status dan pesan
   */
  deleteDocument: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      console.log(`🗑️ Memulai proses penghapusan dokumen ID: ${id}`);
      
      const document = await Document.findByPk(id);
      if (!document) {
        console.log(`❌ Dokumen dengan ID ${id} tidak ditemukan`);
        await t.rollback();
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      console.log(`📄 Dokumen ditemukan: ${document.tipe_dokumen} - ${document.judul}`);

      // Jika dokumen adalah Kartu Keluarga, hapus data family_members terlebih dahulu
      let deletedFamilyMembersCount = 0;
      if (document.tipe_dokumen === "Kartu Keluarga") {
        try {
          console.log(`👨‍👩‍👧‍👦 Menghapus data anggota keluarga untuk dokumen ID: ${id}`);
          
          // Hapus semua family members yang terkait dengan dokumen ini
          deletedFamilyMembersCount = await FamilyMember.destroy({
            where: { documentId: id },
            transaction: t
          });
          console.log(`✅ Berhasil menghapus ${deletedFamilyMembersCount} anggota keluarga untuk dokumen ID: ${id}`);
        } catch (familyError) {
          console.error("❌ Error menghapus family members:", familyError);
          await t.rollback();
          return res.status(500).json({ 
            message: "Gagal menghapus data anggota keluarga", 
            error: familyError.message 
          });
        }
      }

      // Hapus dokumen
      console.log(`🗑️ Menghapus dokumen dari database...`);
      await document.destroy({ transaction: t });

      // Commit transaksi database
      console.log(`✅ Commit transaksi database...`);
      await t.commit();

      // Hapus file fisik dari server (setelah transaksi berhasil)
      if (document.path_file) {
        try {
          console.log(`📁 Menghapus file fisik: ${document.path_file}`);
          fs.unlinkSync(document.path_file);
          console.log(`✅ Berhasil menghapus file fisik: ${document.path_file}`);
        } catch (err) {
          // File mungkin sudah tidak ada, log saja
          console.error("⚠️ Gagal menghapus file fisik:", err.message);
          console.error("⚠️ File mungkin sudah tidak ada atau tidak dapat diakses");
        }
      } else {
        console.log("ℹ️ Tidak ada file fisik yang perlu dihapus");
      }
      
      const message = document.tipe_dokumen === "Kartu Keluarga" 
        ? `Dokumen Kartu Keluarga dan ${deletedFamilyMembersCount} data anggota keluarga berhasil dihapus`
        : "Dokumen berhasil dihapus";
        
      console.log(`🎉 Proses penghapusan selesai: ${message}`);
        
      res.status(200).json({ 
        message: message,
        deletedDocumentType: document.tipe_dokumen,
        deletedDocumentId: id,
        deletedFamilyMembersCount: deletedFamilyMembersCount || 0
      });
    } catch (error) {
      console.error("❌ Error dalam deleteDocument:", error);
      await t.rollback();
      res
        .status(500)
        .json({ message: "Gagal menghapus dokumen", error: error.message });
    }
  },

  // 2a. READ: Mengambil dokumen berdasarkan categoryId (dengan pagination dan filter query)
  getDocumentsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const {
        page = 1,
        limit = 10,
        searchJudul = "",
        searchNomor = "",
        tanggal = "",
      } = req.query;

      const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
      const numericPage = Math.max(parseInt(page, 10) || 1, 1);
      const offset = (numericPage - 1) * numericLimit;

      const andConditions = [{ categoryId }];
      if (searchJudul) {
        andConditions.push({ judul: { [Op.like]: `%${searchJudul}%` } });
      }
      if (searchNomor) {
        andConditions.push({ nomor_surat: { [Op.like]: `%${searchNomor}%` } });
      }
      if (tanggal) {
        andConditions.push({ tanggal_dokumen: tanggal });
      }

      const whereClause = andConditions.length
        ? { [Op.and]: andConditions }
        : { categoryId };

      const total = await Document.count({ where: whereClause });
      const documents = await Document.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        offset,
        limit: numericLimit,
        include: [
          { model: User, attributes: ["id", "nama_lengkap"] },
          { model: Category, attributes: ["id", "nama_kategori"] },
        ],
      });

      return res.status(200).json({
        data: documents,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          total,
          totalPages: Math.ceil(total / numericLimit) || 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil dokumen berdasarkan kategori",
        error: error.message,
      });
    }
  },

  // 6. CHECK: Mengecek apakah NIK sudah ada di database
  checkNIKExists: async (req, res) => {
    try {
      const { nik } = req.params;
      
      if (!nik || nik.length !== 16) {
        return res.status(400).json({
          message: "NIK harus 16 digit",
          exists: false
        });
      }

      const existingMember = await FamilyMember.findOne({
        where: { nik: nik }
      });

      res.status(200).json({
        message: existingMember ? "NIK sudah terdaftar" : "NIK tersedia",
        exists: !!existingMember,
        data: existingMember ? {
          nama_lengkap: existingMember.nama_lengkap,
          status_hubungan: existingMember.status_hubungan
        } : null
      });
    } catch (error) {
      console.error("Error checking NIK:", error);
      res.status(500).json({
        message: "Gagal mengecek NIK",
        error: error.message,
        exists: false
      });
    }
  },
};

module.exports = documentController;
