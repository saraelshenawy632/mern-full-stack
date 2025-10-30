const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    full_description: { type: String, default: "" },
    price: { type: Number, required: true, min: 1 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
    brand: { type: String, default: "" },
    images: { type: [String], default: [] },
    image_url: { type: String, default: "placeholder.jpg" },
    stock: { type: Number, default: 100, min: 0 },
    sku: { type: String, unique: true, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews_count: { type: Number, default: 0, min: 0 },
    manufacturer: { type: String, default: "" },
    model_number: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { collection: "Products", timestamps: true, versionKey: false }
);

const Product = mongoose.model("Products", productSchema);
module.exports = Product;
