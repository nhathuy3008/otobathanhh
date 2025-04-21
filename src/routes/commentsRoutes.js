const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// 📌 Tạo bình luận
router.post('/create', commentController.createComment);

// 📌 Lấy bình luận theo sản phẩm
router.get('/product/:productId', commentController.getCommentsByProductId);

// 📌 Xoá bình luận — yêu cầu accountId gửi kèm body
router.delete('/:id', commentController.deleteComment);

// 📌 Cập nhật bình luận — yêu cầu accountId và newContent
router.put('/:id', commentController.updateComment);

// 📌 Đếm bình luận theo sản phẩm
router.get('/count/:productId', commentController.getCommentCountByProductId);

module.exports = router;
