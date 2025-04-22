const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyRole = require('../middleware/authMiddleware'); // đã đổi tên từ verifyAdmin
router.post('/create', contactController.createContact);
router.get('/', verifyRole('admin','master'),contactController.getAllContacts);
router.get('/:id',verifyRole('admin','master'), contactController.getContactById);
router.put('/:id',verifyRole('admin','master'), contactController.updateContact);
router.patch('/:id/status',verifyRole('admin','master'), contactController.updateContactStatus);
router.delete('/:id',verifyRole('admin','master'), contactController.deleteContact);

module.exports = router;
