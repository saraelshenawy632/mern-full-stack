const express = require('express');
const router = express.Router();

const { authMiddleware, restrictTo } = require('../auth/auth');
const { createOrder, getSpecificOrder, getAllOrders } = require('../controllers/ordercontroller');

router.get('/all', authMiddleware, restrictTo('user', 'admin'), getAllOrders);
router.post('/create', authMiddleware, restrictTo('user', 'admin'), createOrder);
router.get('/:id', authMiddleware, restrictTo('user', 'admin'), getSpecificOrder);

module.exports = router;
