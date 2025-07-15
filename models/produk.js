const mongoose = require("mongoose");

const ProdukSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  stok: Number,
  gambar: String, 
  jumlahTerjual: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", ProdukSchema);
