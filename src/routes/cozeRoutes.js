const express = require('express');
const router = express.Router();
const { handleCozeMessage } = require('../controllers/cozeController');

router.post('/chat', handleCozeMessage);

module.exports = router;
