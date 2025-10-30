const cartModel = require('../models/cartmodel');
const Product = require('../models/productmodel');
const mongoose = require("mongoose");

const addToCart = async (req, res) => {
  const { products } = req.body;
  if (!products || !Array.isArray(products) || products.length === 0)
    return res.status(400).json({ message: "Products array is required." });

  try {
    const userId = req.user._id;
    let cart = await cartModel.findOne({ userId });
    if (!cart) cart = new cartModel({ userId, products: [] });

    for (const { productId, quantity } of products) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Product not found.` });

      const existing = cart.products.find(p => p.productData.toString() === productId);
      if (existing) existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      else cart.products.push({ productData: productId, quantity: Math.min(quantity, product.stock) });
    }

    await cart.save();
    await cart.populate({
      path: "products.productData",
      select: "name price image_url stock", 
    });

    res.status(200).json({ message: "Cart updated successfully.", updatedCart: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const showCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await cartModel.findOne({ userId }).populate({
      path: "products.productData",
      select: "name price image_url stock",
    });
    if (!cart) cart = await cartModel.create({ userId, products: [] });
    res.status(200).json({ cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};

const deleteFromCart = async (req, res) => {
  const { Id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(Id)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const userId = req.user._id;
    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => p.productData.toString() !== Id);
    await cart.save();
    await cart.populate({
      path: "products.productData",
      select: "name price image_url stock",
    });

    res.status(200).json({ message: "Product removed from cart", updatedCart: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// تعديل الكمية
const changeQuantity = async (req, res) => {
  const { productId, action } = req.body;

  if (!productId || !['inc','dec'].includes(action)) {
    return res.status(400).json({ message: "Invalid productId or action" });
  }

  try {
    const userId = req.user._id;
    const cart = await cartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(p => p.productData.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (action === 'inc') {
      if (item.quantity < product.stock) item.quantity += 1;
      else return res.status(400).json({ message: "Reached max stock" });
    } else if (action === 'dec') {
      if (item.quantity > 1) item.quantity -= 1;
      else return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    await cart.save();
    await cart.populate({
      path: "products.productData",
      select: "name price image_url stock",
    });

    res.status(200).json({ message: "Quantity updated", updatedCart: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { addToCart, showCart, deleteFromCart, changeQuantity };
