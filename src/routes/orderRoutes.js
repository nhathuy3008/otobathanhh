const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ==== Order Routes ====

// Tạo đơn hàng
router.post('/', orderController.createOrder);

// Lấy đơn hàng theo account
router.get('/account/:account_id', orderController.getOrdersByAccount);

// Cập nhật trạng thái đơn hàng
router.put('/:id', orderController.updateOrderStatus);

// Xoá đơn hàng
router.delete('/:id', orderController.deleteOrder);

// ==== Order Detail Routes ====

// Thêm chi tiết đơn hàng
router.post('/detail', orderController.addOrderDetail);

// Lấy tất cả chi tiết đơn hàng theo order_id
router.get('/detail/:order_id', orderController.getOrderDetailsByOrder);

// Xóa chi tiết đơn hàng theo id
router.delete('/detail/:id', orderController.deleteOrderDetail);

module.exports = router;
