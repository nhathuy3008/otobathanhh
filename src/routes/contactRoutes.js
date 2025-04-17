const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyRole = require('../middleware/authMiddleware'); // đã đổi tên từ verifyAdmin
router.post('/create', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.put('/:id', contactController.updateContact);
router.patch('/:id/status',verifyRole('admin','master'), contactController.updateContactStatus);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
