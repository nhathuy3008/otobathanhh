const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const verifyRole = require('../middleware/authMiddleware');
// Lấy tất cả bài viết tin tức
router.get('/', newsController.getAllNews);

// Lấy bài viết tin tức theo ID
router.get('/:id',verifyRole('admin','master'), newsController.getNewsById);

// Tạo bài viết tin tức mới
router.post('/create',verifyRole('admin','master'), newsController.createNews);

// Cập nhật bài viết tin tức
router.put('/:id',verifyRole('admin','master'), newsController.updateNews);

// Xóa bài viết tin tức
router.delete('/:id',verifyRole('admin','master'), newsController.deleteNews);

module.exports = router;
