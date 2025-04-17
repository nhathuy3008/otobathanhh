const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const verifyRole = require('../middleware/authMiddleware'); // đã đổi tên từ verifyAdmin
router.get('/', bannerController.getAllBanners);
router.post('/create', verifyRole('admin','master'), bannerController.createBanner);
router.put('/:id', verifyRole('admin','master'), bannerController.updateBanner);
router.delete('/:id', verifyRole('admin','master'), bannerController.deleteBanner);

module.exports = router;
