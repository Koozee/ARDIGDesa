const sequelize = require("../config/database");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middlewares/auth");

const userController = {
  // 1. CREATE: Membuat user baru
  createUser: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      let { username, password, nama_lengkap, jabatan } = req.body;

      const newUser = await User.create(
        {
          username,
          password,
          nama_lengkap,
          jabatan,
        },
        { transaction: t }
      );

      // Jika semua berhasil, commit transaksi
      await t.commit();

      res.status(201).json({
        message: "User berhasil dibuat!",
        data: {
          id: newUser.id,
          username: newUser.username,
          nama_lengkap: newUser.nama_lengkap,
          jabatan: newUser.jabatan,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      // Jika ada satu saja error, batalkan semua proses (rollback)
      await t.rollback();
      res.status(500).json({
        message: "Gagal membuat user",
        error: error.message,
      });
    }
  },

  // 2. READ: Mengambil semua user
  getAllUser: async (req, res) => {
    try {
      const users = await User.findAll({
        order: [["createdAt", "DESC"]],
        attributes: { exclude: ["password"] }, // Tidak menampilkan password
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil data user",
        error: error.message,
      });
    }
  },

  // 3. READ: Mengambil satu user berdasarkan ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] }, // Tidak menampilkan password
      });
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil detail user",
        error: error.message,
      });
    }
  },

  // 4. UPDATE: Memperbarui user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, nama_lengkap, nomor_telepon, jabatan, password, role } =
        req.body;

      // Superadmin bisa mengedit semua user, user biasa hanya bisa mengedit profil sendiri
      if (req.user.role !== "superadmin" && req.user.id != id) {
        return res.status(403).json({
          message: "Anda hanya dapat mengedit profil Anda sendiri",
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Proteksi untuk user ID 1 (superadmin utama)
      if (user.id === 1) {
        if (role && role === "user") {
          return res.status(400).json({
            message:
              "User ID 1 tidak dapat diubah rolenya menjadi 'user'. Role ini harus tetap 'superadmin'.",
          });
        }
      }

      // Jika ada password baru, hash password tersebut
      let updateData = { username, nama_lengkap, nomor_telepon, jabatan, role };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      await user.update(updateData);

      res.status(200).json({
        message: "User berhasil diperbarui",
        data: {
          id: user.id,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          nomor_telepon: user.nomor_telepon,
          jabatan: user.jabatan,
          role: user.role,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal memperbarui user",
        error: error.message,
      });
    }
  },

  // 5. DELETE: Menghapus user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Proteksi untuk user ID 1 (superadmin utama)
      if (user.id === 1) {
        return res.status(400).json({
          message:
            "User ID 1 tidak dapat dihapus. User ini adalah superadmin utama sistem.",
        });
      }

      await user.destroy();
      res.status(200).json({ message: "User berhasil dihapus" });
    } catch (error) {
      res.status(500).json({
        message: "Gagal menghapus user",
        error: error.message,
      });
    }
  },

  // 6. LOGIN: Autentikasi user
  loginUser: async (req, res) => {
    try {
      // Debug: Log request body dan headers
      console.log("Request Body:", req.body);
      console.log("Content-Type:", req.headers["content-type"]);

      // Validasi request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Request body tidak ditemukan atau kosong",
        });
      }

      // Ambil data dari body (bisa dari JSON atau form-data)
      const username = req.body.username;
      const password = req.body.password;

      // Validasi input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username dan password harus diisi",
        });
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Username atau password salah",
        });
      }

      // Convert password to string untuk bcrypt comparison
      const passwordString = String(password);
      const userPasswordString = String(user.password);

      const isValidPassword = await bcrypt.compare(
        passwordString,
        userPasswordString
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Username atau password salah",
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: {
          id: user.id,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          jabatan: user.jabatan,
          role: user.role || "user",
          nomor_telepon: user.nomor_telepon || "-",
        },
        token: token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal melakukan login",
        error: error.message,
      });
    }
  },
};

module.exports = userController;
