const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/loading", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/loading.html"));
});

router.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/payment.html"));
});

module.exports = router;
