const sequelize = require("../config/database");
const { Category, User, Document } = require("../models");

const categoryController = {
  createCategory: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      let { nama_kategori, deskripsi, userId } = req.body;

      const newCategory = await Category.create(
        {
          nama_kategori,
          deskripsi,
          userId,
        },
        { transaction: t }
      );

      // Jika semua berhasil, commit transaksi
      await t.commit();

      res.status(201).json({
        message: "Kategori berhasil dibuat!",
        data: newCategory,
      });
    } catch (error) {
      // Jika ada satu saja error, batalkan semua proses (rollback)
      await t.rollback();
      res.status(500).json({
        message: "Gagal membuat kategori",
        error: error.message,
      });
    }
  },

  // 2. READ: Mengambil semua kategori
  getAllCategory: async (req, res) => {
    try {
      const categories = await Category.findAll({
        order: [["createdAt", "DESC"]],
        include: [{ model: User, attributes: ["id", "nama_lengkap"] }],
      });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil data kategori",
        error: error.message,
      });
    }
  },

  // 3. READ: Mengambil satu kategori berdasarkan ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id, {
        include: [{ model: User, attributes: ["id", "nama_lengkap"] }],
      });
      if (!category) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil detail kategori",
        error: error.message,
      });
    }
  },

  // 4. UPDATE: Memperbarui kategori
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_kategori, deskripsi } = req.body;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
      }
      await category.update({ nama_kategori, deskripsi });
      res
        .status(200)
        .json({ message: "Kategori berhasil diperbarui", data: category });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal memperbarui kategori", error: error.message });
    }
  },

  // 5. DELETE: Menghapus kategori
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
      }

      // Cek apakah ada dokumen yang berelasi dengan kategori ini
      const relatedDocuments = await Document.count({
        where: { categoryId: id }
      });

      if (relatedDocuments > 0) {
        return res.status(400).json({ 
          message: `Kategori tidak dapat dihapus karena masih memiliki ${relatedDocuments} dokumen yang berelasi. Hapus semua dokumen terkait terlebih dahulu.` 
        });
      }

      await category.destroy();
      res.status(200).json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal menghapus kategori", error: error.message });
    }
  },
};

module.exports = categoryController;
