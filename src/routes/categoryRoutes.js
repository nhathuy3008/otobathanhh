const express = require('express');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getAllCategories); // Lấy tất cả danh mục
router.get('/:id', getCategoryById); // Lấy danh mục theo ID
router.post('/create', createCategory); // Tạo danh mục mới
router.put('/:id', updateCategory); // Cập nhật danh mục
router.delete('/:id', deleteCategory); // Xóa danh mục

module.exports = router;