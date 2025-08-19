const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isLoggedIn, isSuperAdmin } = require("../middlewares/auth");

router.post("/login", userController.loginUser);

// Route untuk logout (optional, karena JWT stateless)
router.post("/logout", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout berhasil"
  });
});

router.get("/getusers", isSuperAdmin, userController.getAllUser);

router.post("/createuser", isSuperAdmin, userController.createUser);

router.get("/getuser/:id", isLoggedIn, userController.getUserById);

router.put("/updateuser/:id", isLoggedIn, userController.updateUser);

router.delete("/deleteuser/:id", isSuperAdmin, userController.deleteUser);

module.exports = router;
