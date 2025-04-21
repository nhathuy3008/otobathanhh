require('dotenv').config(); // Nạp biến môi trường từ tệp .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Thêm gói cors
const accountRoutes = require('./routes/accountRoutes');
const roleRoutes = require('./routes/roleRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require ("./routes/productRoutes");
const newsRoutes = require('./routes/newsRoutes');
const commentRoutes = require('./routes/commentsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const cozeRoutes = require('./routes/cozeRoutes');
const cloudinary = require('./cloudinary');
const multer = require('multer');



const app = express();
const PORT = process.env.PORT || 3000; // Lấy cổng từ biến môi trường hoặc mặc định là 3000

// Cấu hình CORS
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:5173','http://127.0.0.1:5500'], // Địa chỉ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
    allowedHeaders: ['Content-Type'], // Các header được phép
    credentials: true, // Cho phép cookie và thông tin xác thực
};

app.use(cors(corsOptions)); // Thêm middleware CORS với cấu hình
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Định tuyến API
app.use('/api/accounts', accountRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/coze', cozeRoutes);
// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/otobathanh', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Kết nối MongoDB thành công');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Kết nối MongoDB thất bại', err);
    });