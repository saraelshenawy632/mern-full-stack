const express = require('express');
const router = express.Router();
const {
  getUsersCount,
  getOrdersCount,
  getProductsCount,
  getTotalRevenue,
  getOrdersByDate,
  getDashboardSummary
} = require('../controllers/admincontroller');

router.get('/users-count', getUsersCount);
router.get('/orders-count', getOrdersCount);
router.get('/products-count', getProductsCount);
router.get('/total-revenue', getTotalRevenue);
router.get('/orders-by-date', getOrdersByDate);
router.get('/summary', getDashboardSummary);

module.exports = router;
