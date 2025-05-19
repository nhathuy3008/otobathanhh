const express = require('express');
const {
    getAllCategoryStaffs,
    getCategoryStaffById,
    createCategoryStaff,
    updateCategoryStaff,
    deleteCategoryStaff
} = require('../controllers/categorystaffController');
const verifyRole = require('../middleware/authMiddleware');
const router = express.Router();

// Lấy tất cả danh mục nhân viên
router.get('/', getAllCategoryStaffs);

// Lấy danh mục nhân viên theo ID
router.get('/:id', getCategoryStaffById);

// Tạo danh mục nhân viên mới (chỉ 'admin' hoặc 'master' mới được phép)
router.post('/create', verifyRole('admin', 'master'), createCategoryStaff);

// Cập nhật danh mục nhân viên
router.put('/:id', verifyRole('admin', 'master'), updateCategoryStaff);

// Xóa danh mục nhân viên
router.delete('/:id', verifyRole('admin', 'master'), deleteCategoryStaff);

module.exports = router;
