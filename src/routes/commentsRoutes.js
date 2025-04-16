const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentController'); // Đảm bảo đường dẫn này đúng

// Route để tạo một bình luận mới
router.post('/create', commentsController.createComment);

// Route để lấy tất cả bình luận cho một bài hát
router.get('/song/:songId', commentsController.getCommentsByProductId);

// Route để xóa một bình luận
router.delete('/:id', commentsController.deleteComment);

// Route để đếm số bình luận cho một bài hát
router.get('/song/:songId/count', commentsController.getCommentCountByProductId);

module.exports = router;