const mongoose = require("mongoose");
const slugify = require("slugify");
const Product = require("../models/productmodel");




const get_all_products = async (req, res) => {
  try {
    const { categoryId, search, limit = 15, page = 1 } = req.query;
    const filter = {};

    if (categoryId) {
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        filter.category = new mongoose.Types.ObjectId(categoryId); 
      } else {
        return res.status(400).json({ success: false, message: "Invalid categoryId" });
      }
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate("category","category_name") 
      .skip(Number(skip))
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), totalPages, totalProducts },
    });
  } catch (error) {
    console.error("Error in get_all_products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const get_product_byId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const add_product = async (req, res) => {
  try {
    const {
      name,
      description,
      full_description,
      price,
      brand,
      categoryId,
      images = [],
      image_url,
      specifications_json = {},
      stock = 0,
      sku,
      featured = false,
      manufacturer,
      model_number,
      rating = 0,
      reviews_count = 0,
    } = req.body;

    if (!name || !description || !price || !brand || !categoryId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const newProduct = new Product({
      name,
      description,
      full_description,
      price,
      brand,
      images,
      image_url,
      specifications_json,
      stock,
      sku: sku || slugify(name),
      featured,
      manufacturer,
      model_number,
      rating,
      reviews_count,
      category: categoryId,
    });

    const createdProduct = await newProduct.save();
    res.status(201).json({ success: true, message: "Product created successfully", data: createdProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    if (updates.stock !== undefined && updates.stock < 0) {
      updates.stock = 0;
    }

    if (updates.categoryId) {
      updates.category = updates.categoryId;
      delete updates.categoryId;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!updatedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const get_all_brands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  get_all_products,
  get_product_byId,
  add_product,
  updateProduct,
  deleteProduct,
  get_all_brands,
};
