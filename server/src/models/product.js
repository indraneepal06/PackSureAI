const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      default: "",
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
      default: null,
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