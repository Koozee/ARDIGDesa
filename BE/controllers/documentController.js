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
    if (nomorKK) extractedData.rincian_dokumen.nomor_kk = nomorKK;

    const alamatMatch = text.match(alamatRegex);
    if (alamatMatch) extractedData.rincian_dokumen.alamat = alamatMatch[1].trim();

    // Ekstraksi Desa/Kelurahan dan Kecamatan
    const desaMatch = text.match(desaRegex);
    if (desaMatch) extractedData.rincian_dokumen.desa_kelurahan = desaMatch[1].trim();

    const kecamatanMatch = text.match(kecamatanRegex);
    if (kecamatanMatch)
      extractedData.rincian_dokumen.kecamatan = kecamatanMatch[1].trim();
  } catch (err) {
    console.error("Error saat parsing teks OCR:", err);
  }

  return extractedData;
};

// Obyek untuk menampung semua fungsi controller
const documentController = {
  // FUNGSI BARU UNTUK OCR
  scanDocument: async (req, res) => {
    // Pastikan ada file yang diunggah
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah!" });
    }

    const filePath = req.file.path;

    try {
      console.log(`Memulai proses OCR untuk file: ${filePath}`);

      // Menjalankan Tesseract OCR pada file gambar
      const result = await Tesseract.recognize(filePath, "ind"); // 'ind' untuk Bahasa Indonesia

      console.log("Teks mentah hasil OCR berhasil didapat.");

      // Mem-parsing teks mentah untuk mendapatkan data terstruktur
      const extractedData = parseKKData(result.data.text);
      console.log(extractedData);
      // Kirim data hasil parsing ke frontend (hanya rincian_dokumen tanpa anggota_keluarga)
      const isDebug =
        String(req.query.debug || "").toLowerCase() === "true" ||
        req.query.debug === "1";
      const responsePayload = {
        message: "File berhasil dipindai!",
        data: { rincian_dokumen: extractedData.rincian_dokumen },
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
        whereClause[Op.and].push({ nomor_surat: { [Op.like]: `%${searchNomor}%` } });
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

  // 5. DELETE: Menghapus dokumen
  deleteDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      // Hapus file fisik dari server (jika ada)
      if (document.path_file) {
        try {
          fs.unlinkSync(document.path_file);
        } catch (err) {
          // File mungkin sudah tidak ada, log saja
          console.error("Gagal menghapus file fisik:", err.message);
        }
      }

      await document.destroy();
      res.status(200).json({ message: "Dokumen berhasil dihapus" });
    } catch (error) {
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

      const whereClause = andConditions.length ? { [Op.and]: andConditions } : { categoryId };

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
};

module.exports = documentController;