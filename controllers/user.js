const User = require("../models/user");
const mongoose = require("mongoose");

// CREATE User
const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("Error in createUser :", err);
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN User
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = false;

    // FIX: Save the session before responding to prevent connection issues.
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Error saving session" });
      }
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          username: user.username,
        },
      });
    });
  } catch (err) {
    console.error("Error in loginUser :", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// READ All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ Single User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE User
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHECK LOGIN STATUS
const checkLoginStatus = async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        return res.json({
          isLoggedIn: true,
          user: {
            _id: user._id.toString(),
            username: user.username,
          },
        });
      }
    } catch (err) {
      // If error, treat as not logged in
      return res.json({ isLoggedIn: false, user: null });
    }
  }
  // If no session or userId, treat as not logged in
  res.json({ isLoggedIn: false, user: null });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  checkLoginStatus,
};