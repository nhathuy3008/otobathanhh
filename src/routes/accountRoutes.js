
const express = require('express');
const router = express.Router();
const multer = require('multer');
const accountController = require('../controllers/accountController');
const passport = require('passport');
require('../config/passport'); 
// Cấu hình multer để lưu ảnh vào bộ nhớ RAM
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', accountController.createAccount);
router.get('/verify', accountController.verifyAccount);
router.post('/login', accountController.login);
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.put('/:id', upload.single('image'), accountController.updateAccount); // ✅ Thêm multer
router.post('/validate-password', accountController.validatePassword);
router.post('/verify', accountController.verifyAccount);

// Route để gửi mã xác minh quên mật khẩu
router.post('/forgot-password', accountController.forgotPassword);
// Route để đặt lại mật khẩu
router.post('/reset-password', accountController.resetPassword);
// Route để xác minh mã xác nhận
router.post('/verify-code', accountController.verifyCode); 
router.post('/google-login',
    passport.authenticate('google-token', { session: false }),
    accountController.googleLogin
  );
router.post('/facebook-login',
    passport.authenticate('facebook-token', { session: false }),
    accountController.facebookLogin
  );
module.exports = router;
