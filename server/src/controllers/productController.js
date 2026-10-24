const Product = require("../models/product");
const axios = require("axios");
const mongoose = require("mongoose");

// Add a new product
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This barcode already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search products by name
const searchProducts = async (req, res) => {
  try {
    const search = req.query.search || "";

    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an existing product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This barcode already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    // Step 1: Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Step 2: Find and delete the product
    const product = await Product.findByIdAndDelete(req.params.id);

    // Step 3: Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Step 4: Send success response
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// Get expired products
const getExpiredProducts = async (req, res) => {
  try {
    const products = await Product.find({
      expiryDate: { $ne: null, $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get products containing harmful ingredients
const getProductsWithHarmfulIngredients = async (req, res) => {
  try {
    const products = await Product.find({
      harmfulIngredients: { $exists: true, $ne: [] },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get products by suitability condition
const getProductsBySuitability = async (req, res) => {
  try {
    const condition = req.query.condition?.trim();

    if (!condition) {
      return res.status(400).json({
        success: false,
        message: "Please provide a condition to search",
      });
    }

    const products = await Product.find({
      notSuitableFor: {
        $elemMatch: {
          $regex: condition,
          $options: "i",
        },
      },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search product in MongoDB, then Open Food Facts
const getProductByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode?.trim();

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required",
      });
    }

    // Step 1: Search MongoDB
    const existingProduct = await Product.findOne({ barcode });

    if (existingProduct) {
      const isExpired =
        existingProduct.expiryDate &&
        existingProduct.expiryDate < new Date();

      return res.status(200).json({
        success: true,
        source: "MongoDB",
        message: isExpired
          ? "Warning: This product has expired!"
          : "Product found",
        isExpired: Boolean(isExpired),
        data: existingProduct,
      });
    }

    // Step 2: Search Open Food Facts
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
        barcode
      )}.json`,
      {
        params: {
          fields:
            "code,product_name,brands,ingredients_text,quantity,image_front_url",
        },
        timeout: 10000,
      }
    );

    const result = response.data;

    // Step 3: Check whether the barcode exists
    if (result.status !== 1 || !result.product) {
      return res.status(404).json({
        success: false,
        source: "Open Food Facts",
        message:
          "Product not found. Please enter the product details manually.",
        needsManualEntry: true,
        data: { barcode },
      });
    }

    const externalProduct = result.product;

    // Step 4: Check whether the product name is available
    if (!externalProduct.product_name?.trim()) {
      return res.status(200).json({
        success: true,
        source: "Open Food Facts",
        message:
          "Barcode found, but product details are incomplete. Please enter the details manually.",
        needsManualEntry: true,
        data: {
          barcode,
          brand: externalProduct.brands || "",
          ingredients: externalProduct.ingredients_text
            ? externalProduct.ingredients_text
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
          quantity: externalProduct.quantity || "",
          image: externalProduct.image_front_url || "",
        },
      });
    }

    // Step 5: Return external data for confirmation.
    // Do not save automatically because price and expiry date
    // cannot reliably be obtained from this barcode response.
    return res.status(200).json({
      success: true,
      source: "Open Food Facts",
      message:
        "Product details found. Please provide price and expiry date before saving.",
      needsManualEntry: true,
      data: {
        barcode,
        name: externalProduct.product_name.trim(),
        brand: externalProduct.brands || "",
        ingredients: externalProduct.ingredients_text
          ? externalProduct.ingredients_text
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        quantity: externalProduct.quantity || "",
        price: null,
        expiryDate: null,
        harmfulIngredients: [],
        notSuitableFor: [],
        image: externalProduct.image_front_url || "",
      },
    });
  } catch (error) {
    console.error("Barcode search error:", error.message);

    return res.status(502).json({
      success: false,
      message:
        "External product search failed. Please try again.",
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  searchProducts,
  updateProduct,
  deleteProduct,
  getExpiredProducts,
  getProductsWithHarmfulIngredients,
  getProductsBySuitability,
  getProductByBarcode,
};