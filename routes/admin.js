const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// CREATE Admin
router.post("/admin", adminController.createAdmin);

// READ All Admins
router.get("/admin", adminController.getAllAdmins);

// READ Single Admin by ID
router.get("/admin/:id", adminController.getAdminById);

// UPDATE Admin
router.put("/admin/:id", adminController.updateAdmin);

// DELETE Admin
router.delete("/admin/:id", adminController.deleteAdmin);

// LOGIN Admin
router.post("/admin/login", adminController.loginAdmin);

module.exports = router;
