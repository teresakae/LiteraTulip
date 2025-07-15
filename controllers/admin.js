const Admin = require("../models/admin");

// CREATE Admin
const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ Single Admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE Admin
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE Admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN Admin
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = password === admin.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    req.session.userId = admin._id;
    req.session.username = admin.username;
    req.session.isAdmin = true;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Error saving session" });
      }
      res.status(200).json({
        message: "Login successful",
        admin: {
          id: admin._id,
          username: admin.username,
        },
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// CHECK ADMIN LOGIN STATUS
const checkAdminLoginStatus = async (req, res) => {
  if (req.session && req.session.userId && req.session.isAdmin) {
    try {
      const admin = await Admin.findById(req.session.userId);
      if (admin) {
        return res.json({
          isLoggedIn: true,
          isAdmin: true,
          user: {
            _id: admin._id.toString(),
            username: admin.username,
          },
        });
      }
    } catch (err) {
      return res.json({ isLoggedIn: false, isAdmin: false, user: null });
    }
  }
  res.json({ isLoggedIn: false, isAdmin: false, user: null });
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  checkAdminLoginStatus,
};