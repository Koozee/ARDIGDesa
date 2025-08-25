const express = require("express");
const router = express.Router();
const { isLoggedIn, isSuperAdmin, isUser } = require("../middlewares/auth");
const documentController = require("../controllers/documentController");
const upload = require("../middlewares/upload"); // <-- 1. IMPORT MIDDLEWARE

// Pisahkan route GET dan POST untuk /documents
router.get("/getdocs", isLoggedIn, documentController.getAllDocuments);
router.post(
  "/createdoc",
  isUser,
  upload.single("documentFile"),
  documentController.createDocument
);

// Endpoint untuk uji OCR (mengembalikan hasil extractedData tanpa menyimpan ke DB)
router.post(
  "/scan",
  isUser,
  upload.single("documentFile"),
  documentController.scanDocument
);

router.get("/getdoc/:id", isUser, documentController.getDocumentById);
router.put("/updatedoc/:id", isUser, documentController.updateDocument);
router.delete("/deletedoc/:id", isUser, documentController.deleteDocument);
router.get("/getdocs/category/:categoryId", isUser, documentController.getDocumentsByCategory);

// Endpoint untuk mengecek NIK yang sudah ada
router.get("/check-nik/:nik", isUser, documentController.checkNIKExists);

module.exports = router;
