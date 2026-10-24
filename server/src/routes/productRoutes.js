const express = require("express");
const router = express.Router();

const {
  addProduct,
  getAllProducts,
  searchProducts,
  updateProduct,
  deleteProduct,
  getExpiredProducts,
  getProductsWithHarmfulIngredients,
  getProductsBySuitability,
  getProductByBarcode
} = require("../controllers/productController");

// Search products by name
router.get("/search", searchProducts);

// Get all products
router.get("/", getAllProducts);

// Get expired products
router.get("/expired", getExpiredProducts);

// Get product by barcode
router.get("/barcode/:barcode", getProductByBarcode);

// Get products with harmful ingredients
router.get("/harmful", getProductsWithHarmfulIngredients);

// Get products by suitability
router.get("/suitability", getProductsBySuitability);

// Add a new product
router.post("/", addProduct);

// Update an existing product
router.put("/:id", updateProduct);

// Delete a product
router.delete("/:id", deleteProduct);
module.exports = router;