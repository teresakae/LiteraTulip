const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const User = require("../models/user"); // Pastikan Anda mengimpor model User

// CREATE User
router.post("/users", userController.createUser );

// LOGIN User
router.post("/users/login", userController.loginUser );

// READ All Users
router.get("/users", userController.getAllUsers);

// READ Single User by ID
router.get("/users/:id", userController.getUserById);

// UPDATE User
router.put("/users/:id", userController.updateUser );

// DELETE User
router.delete("/users/:id", userController.deleteUser );

// NEW: Get Logged-in User Information
const getLoggedInUser  = async (req, res) => {
  try {
    // Pastikan pengguna sudah login dan ID pengguna tersimpan di sesi
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No user logged in" });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      // Ini bisa terjadi jika ID pengguna di sesi tidak valid atau pengguna sudah dihapus
      req.session.destroy(); // Hapus sesi yang tidak valid
      return res.status(404).json({ message: "User  not found" });
    }
    
    // Kirim kembali informasi pengguna (tanpa password)
    res.status(200).json({
      id: user._id.toString(), // Mengubah ObjectId menjadi string
      username: user.username,
      // Tambahkan properti lain yang ingin Anda kirim
    });
  } catch (err) {
    console.error("Error in getLoggedInUser :", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Endpoint untuk mendapatkan informasi pengguna yang sedang login
router.get('/me', getLoggedInUser );

module.exports = router;
