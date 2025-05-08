const Produk = require("../models/produk");
const asyncErrorWrapper = require("../middlewares/asyncErrorWrapper");
const CustomError = require("../helpers/CustomError");
const mongoose = require("mongoose");

// ADD Product
const addProduct = asyncErrorWrapper(async (req, res, next) => {
  const { nama } = req.body;

  const existingProduct = await Produk.findOne({ nama });
  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "Produk dengan nama ini sudah ada.",
    });
  }

  const newProduct = await Produk.create(req.body);
  res.status(201).json({
    success: true,
    message: "Produk telah berhasil ditambahkan.",
    newProduct,
  });
});

// EDIT Product
const editProduct = async (req, res) => {
  try {
    const product = await Produk.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET Product by id
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Produk.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await Produk.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Produk deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//GET Product
const getProducts = async (req, res) => {
  try {
    const products = await Produk.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//GET Best Selling Products
const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Produk.find({});

    const bestSelling = products.map((product) => ({
      nama: product.nama,
      totalSold: product.jumlahTerjual || 0,
    }));

    res.json(bestSelling);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch best-selling products" });
  }
};

module.exports = {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct,
  getProductById,
  getBestSellingProducts,
};
