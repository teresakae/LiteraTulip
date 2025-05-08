const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const { getBestSellingProducts } = require("../controllers/product");

// CREATE Product
router.post("/product", productController.addProduct);

// READ All Products
router.get("/product", productController.getProducts);

// READ Single Product by ID
router.get("/product/:id", productController.getProductById);

// UPDATE Product
router.put("/product/:id", productController.editProduct);

// DELETE Product
router.delete("/product/:id", productController.deleteProduct);

// BEST SELLING Product
router.get("/best-selling-products", getBestSellingProducts);

module.exports = router;
