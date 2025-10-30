const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "fa-solid fa-box" },
  },
  { collection: "Categories", timestamps: true }
);

const Category = mongoose.model("Categories", categorySchema);
module.exports = Category;
