const express = require("express");
const { isSuperAdmin, isUser, isLoggedIn } = require("../middlewares/auth");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Pisahkan route GET dan POST untuk /categories
router.get("/getcats", isLoggedIn, categoryController.getAllCategory);
router.post("/createcat", isSuperAdmin, categoryController.createCategory);

router.get("/getcat/:id", isUser, categoryController.getCategoryById);
router.put("/updatecat/:id", isSuperAdmin, categoryController.updateCategory);
router.delete(
  "/deletecat/:id",
  isSuperAdmin,
  categoryController.deleteCategory
);

module.exports = router;
