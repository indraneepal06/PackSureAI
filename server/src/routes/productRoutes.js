const express = require("express");
const router = express.Router();

const {
  addProduct,
  getAllProducts,
  searchProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Search products by name
router.get("/search", searchProducts);

// Get all products
router.get("/", getAllProducts);

// Add a new product
router.post("/", addProduct);

// Update an existing product
router.put("/:id", updateProduct);

// Delete a product
router.delete("/:id", deleteProduct);
module.exports = router;