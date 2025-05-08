const mongoose = require("mongoose");
const ProdukSchema = new mongoose.Schema({
  nama: String,
  harga: Number,
  stok: Number,
  jumlahTerjual: { type: Number, default: 0 },
});
module.exports = mongoose.model("Product", ProdukSchema);
