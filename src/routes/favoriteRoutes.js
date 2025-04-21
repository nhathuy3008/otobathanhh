const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController'); // Đảm bảo đường dẫn này đúng

// Thêm sản phẩm vào danh sách yêu thích
router.post('/like', favoriteController.likeProduct);

// Lấy danh sách sản phẩm yêu thích của một tài khoản
router.get('/account/:accountId/products', favoriteController.getFavoriteProducts);

// Đếm số lượt thích cho một sản phẩm
router.get('/product/:productId/likes/count', favoriteController.countLikesForProduct);

// Kiểm tra xem sản phẩm đã được thích bởi tài khoản chưa
router.get('/account/:accountId/product/:productId/liked', favoriteController.isProductLiked);

// Hủy thích sản phẩm
router.delete('/unlike/:accountId/:productId', (req, res) => {
    console.log('Yêu cầu DELETE nhận được với params:', req.params);
    favoriteController.unlikeProduct(req, res);
});

module.exports = router;
