const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Helper function untuk generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      jabatan: user.jabatan,
      role: user.role || 'user',
      nomor_telepon: user.nomor_telepon || '-'
    },
    jwtConfig.JWT_SECRET,
    { expiresIn: jwtConfig.JWT_EXPIRES_IN }
  );
};

// Helper function untuk verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Export helper functions
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;

// Middleware untuk mengecek apakah user sudah login
exports.isLoggedIn = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan, silakan login terlebih dahulu."
      });
    }

    // Ekstrak token dari "Bearer <token>"
    const token = authHeader.substring(7);

    // Verifikasi token
    const decoded = verifyToken(token);
    
    // Tambahkan user ke request untuk digunakan di controller
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Error in isLoggedIn middleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid, silakan login ulang."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa, silakan login ulang."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server."
    });
  }
};

// Middleware untuk mengecek apakah user adalah Super Admin
exports.isSuperAdmin = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan, silakan login terlebih dahulu."
      });
    }

    // Ekstrak token dari "Bearer <token>"
    const token = authHeader.substring(7);

    // Verifikasi token
    const decoded = verifyToken(token);
    
    // Cek apakah user memiliki role superadmin
    if (decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda tidak memiliki hak sebagai Super Admin."
      });
    }

    // Tambahkan user ke request untuk digunakan di controller
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Error in isSuperAdmin middleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid, silakan login ulang."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa, silakan login ulang."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server."
    });
  }
};

// Middleware untuk mengecek apakah user adalah User biasa
exports.isUser = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan, silakan login terlebih dahulu."
      });
    }

    // Ekstrak token dari "Bearer <token>"
    const token = authHeader.substring(7);

    // Verifikasi token
    const decoded = verifyToken(token);
    
    // Cek apakah user memiliki role user atau superadmin
    if (decoded.role !== "user" && decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Role tidak valid."
      });
    }

    // Tambahkan user ke request untuk digunakan di controller
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Error in isUser middleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid, silakan login ulang."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token telah kadaluarsa, silakan login ulang."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server."
    });
  }
};
