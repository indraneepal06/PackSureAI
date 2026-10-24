const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
    },

    ingredients: {
      type: [String],
      default: [],
    },

    quantity: {
      type: String,
      default: "",
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    harmfulIngredients: {
      type: [String],
      default: [],
    },
    harmfulIngredients: {
      type: [String],
      default: [],
    },

    notSuitableFor: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);