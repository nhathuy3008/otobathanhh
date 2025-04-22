const express = require('express');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const verifyRole = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getAllCategories); // Lấy tất cả danh mục
router.get('/:id', getCategoryById); // Lấy danh mục theo ID
router.post('/create',verifyRole('admin','master'), createCategory); // Tạo danh mục mới
router.put('/:id',verifyRole('admin','master'), updateCategory); // Cập nhật danh mục
router.delete('/:id',verifyRole('admin','master'), deleteCategory); // Xóa danh mục

module.exports = router;