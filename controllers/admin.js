const Admin = require("../models/admin");

// CREATE Admin
const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const admin = new Admin({
      username,
      password,
    });

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
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    Object.assign(admin, req.body);
    await admin.save();
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE Admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Admin.deleteOne({ _id: req.params.id });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN Admin (verify username and password)
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = password === admin.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
};
