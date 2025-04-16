// const multer = require('multer');
// const storage = multer.memoryStorage(); // Lưu trữ tạm thời trong bộ nhớ
// const upload = multer({ storage });

// module.exports = upload;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
    { name: 'file', maxCount: 1 }, // Trường cho file nhạc
    { name: 'image', maxCount: 1 }  // Trường cho hình ảnh
]);

module.exports = upload;
