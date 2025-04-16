const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Lấy tất cả bài viết tin tức
router.get('/', newsController.getAllNews);

// Lấy bài viết tin tức theo ID
router.get('/:id', newsController.getNewsById);

// Tạo bài viết tin tức mới
router.post('/create', newsController.createNews);

// Cập nhật bài viết tin tức
router.put('/:id', newsController.updateNews);

// Xóa bài viết tin tức
router.delete('/:id', newsController.deleteNews);

module.exports = router;
