const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const multer = require("multer");
const path = require("path");

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- Standardized Product Routes ---

// GET all products -> /api/products
router.get("/products", productController.getProducts);

// CREATE one product -> /api/products
router.post("/products", upload.single('productImage'), productController.addProduct);

// GET one product by ID -> /api/products/:id
router.get("/products/:id", productController.getProductById);

// UPDATE one product by ID -> /api/products/:id
router.put("/products/:id", upload.single('productImage'), productController.editProduct);

// DELETE one product by ID -> /api/products/:id
router.delete("/products/:id", productController.deleteProduct);


// --- Special Routes (No Change Needed) ---

// GET BEST SELLING Products
router.get("/best-selling-products", productController.getBestSellingProducts);

// POST dummy data
router.post("/products/load-dummy", productController.loadDummyProducts);


module.exports = router;