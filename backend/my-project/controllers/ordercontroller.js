const orderModel = require("../models/ordermodel");
const cartModel = require("../models/cartmodel");
const productModel = require("../models/productmodel");

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ message: "success", data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, cardInfo } = req.body;

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.phone)
      return res.status(400).json({ message: "Shipping address required." });

    const validMethods = ["cash", "card"];
    const method = (paymentMethod || "cash").toLowerCase();
    if (!validMethods.includes(method))
      return res.status(400).json({ message: "Invalid payment method." });

    if (method === "card") {
      const { number, name, expiry, cvv } = cardInfo || {};
      if (!number || !name || !expiry || !cvv)
        return res.status(400).json({ message: "Incomplete card information." });
    }

    const cart = await cartModel.findOne({ userId }).populate("products.productData");
    if (!cart || cart.products.length === 0)
      return res.status(400).json({ message: "Cart is empty." });

    const purchasedItems = [];
    let totalOrderPrice = 0;

    for (const item of cart.products) {
      const product = item.productData;
      if (!product) return res.status(400).json({ message: "Invalid product." });

      if (product.stock < item.quantity)
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });

      purchasedItems.push({
        productId: product._id,
        productname: product.name,
        price: product.price,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
      });

      totalOrderPrice += product.price * item.quantity;

const updatedProduct = await productModel.findById(product._id);

if (!updatedProduct) {
  return res.status(400).json({ message: `Product not found: ${product.name}` });
}

if (updatedProduct.stock < item.quantity) {
  return res.status(400).json({
    message: `Insufficient stock for ${updatedProduct.name}. Available: ${updatedProduct.stock}`,
  });
}

updatedProduct.stock -= item.quantity;

if (updatedProduct.stock < 0) updatedProduct.stock = 0;

await updatedProduct.save();

    }

    const order = await orderModel.create({
      userId,
      purchasedItems,
      totalOrderPrice,
      shippingAddress,
      paymentMethod: method,
      ...(method === "card" && { cardInfo }),
    });

    cart.products = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};

const getSpecificOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await orderModel.findOne({ userId: req.user._id, _id: id });

    if (!order) return res.status(404).json({ message: "Order not found." });

    res.status(200).json({ message: "success", data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getSpecificOrder,
  getAllOrders,
};
