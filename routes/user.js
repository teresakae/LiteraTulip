const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { loginUser } = require("../controllers/user");

// CREATE User
router.post("/users", userController.createUser);

//LOGIN User
router.post("/users/login", userController.loginUser);

// READ All Users
router.get("/users", userController.getAllUsers);

// READ Single User by ID
router.get("/users/:id", userController.getUserById);

// UPDATE User
router.put("/users/:id", userController.updateUser);

// DELETE User
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
