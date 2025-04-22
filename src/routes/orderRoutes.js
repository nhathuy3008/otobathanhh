const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyRole = require('../middleware/authMiddleware');
// ==== Order Routes ====

// Tạo đơn hàng
router.post('/', orderController.createOrder);

// Lấy đơn hàng theo account
router.get('/account/:account_id', orderController.getOrdersByAccount);

// Cập nhật trạng thái đơn hàng
router.put('/:id',verifyRole('admin','master'), orderController.updateOrderStatus);

// Xoá đơn hàng
router.delete('/:id',verifyRole('admin','master'), orderController.deleteOrder);

// ==== Order Detail Routes ====

// Thêm chi tiết đơn hàng
router.post('/detail',verifyRole('admin','master'), orderController.addOrderDetail);

// Lấy tất cả chi tiết đơn hàng theo order_id
router.get('/detail/:order_id', orderController.getOrderDetailsByOrder);

// Xóa chi tiết đơn hàng theo id
router.delete('/detail/:id', orderController.deleteOrderDetail);

module.exports = router;
