const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const verifyRole = require('../middleware/authMiddleware');
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/create',verifyRole('admin', 'master'), staffController.createStaff);
router.put('/:id',verifyRole('admin', 'master'), staffController.updateStaff);
router.delete('/:id',verifyRole('admin', 'master'), staffController.deleteStaff);

module.exports = router;
