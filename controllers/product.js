const Produk = require("../models/produk");
const asyncErrorWrapper = require("../middlewares/asyncErrorWrapper");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs'); // File System module for deleting files

/**
 * Adds a new product.
 * This function is flexible:
 * - If a file is uploaded (from frontend), it uses the file's path.
 * - If a 'gambar' string is provided in the body (from backend/Postman), it uses that string.
 */
const addProduct = asyncErrorWrapper(async (req, res, next) => {
  const { nama, harga, stok } = req.body;
  let gambarPath;

  // Case 1: A file was uploaded.
  if (req.file) {
    gambarPath = `/images/${req.file.filename}`;
  } 
  // Case 2: No file, but a 'gambar' string was provided.
  else if (req.body.gambar) {
    gambarPath = req.body.gambar;
  } 
  // Case 3: Neither was provided.
  else {
    return res.status(400).json({
      success: false,
      message: "Product image is required as a file upload or a 'gambar' text path.",
    });
  }

  const existingProduct = await Produk.findOne({ nama });
  if (existingProduct) {
    // If product exists and a new file was uploaded, delete the orphaned file.
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: "Produk dengan nama ini sudah ada.",
    });
  }

  const newProduct = await Produk.create({
    nama,
    harga,
    stok,
    gambar: gambarPath,
  });

  res.status(201).json({
    success: true,
    message: "Produk telah berhasil ditambahkan.",
    newProduct,
  });
});

/**
 * Edits an existing product.
 */
const editProduct = async (req, res) => {
  try {
    const product = await Produk.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update text fields from the request body
    product.nama = req.body.nama || product.nama;
    product.harga = req.body.harga || product.harga;
    product.stok = req.body.stok || product.stok;

    // Check if a new file was uploaded
    if (req.file) {
      // If there's an old image, delete it from the server
      if (product.gambar) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.gambar);
        // Use fs.unlink to delete, but check if file exists first to avoid errors
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Set the new image path
      product.gambar = `/images/${req.file.filename}`;
    }

    // Save the updated product
    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
};
/**
 * Gets a single product by its ID.
 */
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

/**
 * Deletes a product by its ID.
 */
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

/**
 * Gets all products.
 */
const getProducts = async (req, res) => {
  try {
    const products = await Produk.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gets best selling products based on 'jumlahTerjual'.
 */
const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Produk.find({}).sort({ jumlahTerjual: -1 }).limit(5);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch best-selling products" });
  }
};

/**
 * Utility function to bulk-load dummy products from a JSON array.
 */
const loadDummyProducts = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Request body must be an array of products." });
    }
    await Produk.deleteMany({});
    const insertedProducts = await Produk.insertMany(products);
    res.status(201).json({ 
      message: `${insertedProducts.length} products have been successfully loaded.`,
      data: insertedProducts 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct,
  getProductById,
  getBestSellingProducts,
  loadDummyProducts
};