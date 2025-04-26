const express = require('express');
const roleController = require('../controllers/roleController');
const verifyRole = require('../middleware/authMiddleware'); // đã đổi tên từ verifyAdmin

const router = express.Router();

// ✅ Đưa các route cụ thể lên trước để tránh bị nhầm với route động
router.put('/disable',verifyRole('master'), roleController.disableAccount);
router.put('/enable', verifyRole('master'),roleController.enableAccount); // nếu cần

// Các route chỉ cho phép 'admin' hoặc 'master'
router.get('/', verifyRole('master'), roleController.getAllRoles);
router.get('/:id', verifyRole('master'), roleController.getRoleById);
router.post('/create', roleController.createRole);
router.put('/:id', verifyRole('master'), roleController.updateRole);
router.delete('/:id', verifyRole('master'), roleController.deleteRole);
router.post('/assign', roleController.assignRoleToAccount);
router.post('/remove', verifyRole('master'), roleController.removeRoleFromAccount);

module.exports = router;
