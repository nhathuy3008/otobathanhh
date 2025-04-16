const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cartItemContorller');

// 🟢 Thêm sản phẩm vào giỏ hàng
router.post('/cart', addToCart);

// 🧠 Lấy tất cả sản phẩm trong giỏ hàng của người dùng
router.get('/cart/:account_id', getCartItems);

// 🔄 Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/cart/:id', updateCartItem);

// ❌ Xóa một sản phẩm khỏi giỏ hàng
router.delete('/cart/:id', removeFromCart);

module.exports = router;
