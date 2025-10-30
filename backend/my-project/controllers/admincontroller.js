const User = require('../models/usermodel');
const Order = require('../models/ordermodel');
const Product = require('../models/productmodel');

exports.getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ totalOrders: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ totalProducts: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalOrderPrice, 0);
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByDate = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalOrderPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();

    const totalRevenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalOrderPrice" } } }]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const revenueByDate = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$totalOrderPrice" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ usersCount, ordersCount, productsCount, totalRevenue, ordersByDate: revenueByDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
