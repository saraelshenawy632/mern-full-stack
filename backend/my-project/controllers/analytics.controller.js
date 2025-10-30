import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const salesByMonth = await Order.aggregate([
      { $addFields: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } } },
      { $group: { _id: "$month", totalSales: { $sum: "$totalPrice" }, ordersCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", qtySold: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
      { $sort: { qtySold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $project: { productName: "$product.title", qtySold: 1, revenue: 1 } }
    ]);

    const activeCarts = await Cart.countDocuments({ active: true });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      salesByMonth,
      topProducts,
      activeCarts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
