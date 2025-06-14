// require('dotenv').config(); // Nạp biến môi trường từ tệp .env
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors'); // Thêm gói cors
// const accountRoutes = require('./routes/accountRoutes');
// const roleRoutes = require('./routes/roleRoutes');
// const categoryRoutes = require("./routes/categoryRoutes");
// const productRoutes = require ("./routes/productRoutes");
// const newsRoutes = require('./routes/newsRoutes');
// const commentRoutes = require('./routes/commentsRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const bannerRoutes = require('./routes/bannerRoutes');
// const contactRoutes = require('./routes/contactRoutes');
// const cozeRoutes = require('./routes/cozeRoutes');
// const favoriteRoutes = require ('./routes/favoriteRoutes')
// const telegramWebhook = require('./routes/telegramWebhook');
// const categorystaffRoutes = require ('./routes/categorystaffRoutes');
// const staffRoutes = require ('./routes/staffRoutes');
// const cloudinary = require('./cloudinary');
// const multer = require('multer');



// const app = express();
// const PORT = process.env.PORT || 3000; // Lấy cổng từ biến môi trường hoặc mặc định là 3000

// // Cấu hình CORS
// const corsOptions = {
//     origin: ['http://localhost:3001', 'http://localhost:5173','https://fe-otobathanh.vercel.app','https://otobathanh-front-end.vercel.app'], // Địa chỉ frontend
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true, // Cho phép cookie và thông tin xác thực
// };

// app.use(cors(corsOptions)); // Thêm middleware CORS với cấu hình
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// // Định tuyến API
// app.use('/api/accounts', accountRoutes);
// app.use('/api/roles', roleRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/news', newsRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/banners', bannerRoutes);
// app.use('/api/contacts', contactRoutes);
// app.use('/api/coze', cozeRoutes);
// app.use('/api/favorites', favoriteRoutes);
// app.use('/api/categoriesStaff', categorystaffRoutes);
// app.use('/api/staff', staffRoutes);
// app.use('/', telegramWebhook);

// // Kết nối đến MongoDB


// mongoose.connect('mongodb://localhost:27017/otobathanh', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Kết nối MongoDB thành công');
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch(err => {
//         console.error('Kết nối MongoDB thất bại', err);
//     });
// // mongoose.connect(process.env.MONGODB_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true
// // }).then(() => {
// //     console.log('✅ Connected to MongoDB');

// //     // 🔥 Quan trọng: bắt đầu server sau khi kết nối MongoDB thành công
// //     app.listen(PORT, () => {
// //         console.log(`🚀 Server is running on port ${PORT}`);
// //     });
// // }).catch(err => {
// //     console.error('❌ MongoDB connection error:', err);
// // });
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket'); // 👈 Quan trọng

// Import routes
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
const favoriteRoutes = require ('./routes/favoriteRoutes');
const telegramWebhook = require('./routes/telegramWebhook');
const categorystaffRoutes = require ('./routes/categorystaffRoutes');
const staffRoutes = require ('./routes/staffRoutes');

const app = express();
const server = http.createServer(app); // 👈 Thay vì app.listen
const io = new Server(server, {
    cors: {
        origin: ['https://bathanhvn.com', 'http://localhost:3001','https://fe-otobathanh.vercel.app','https://otobathanh-front-end.vercel.app','https://www.bathanhvn.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }
});
setupSocket(io); // 👈 Kích hoạt WebSocket với logic đã viết

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://bathanhvn.com', 'http://localhost:3001','https://fe-otobathanh.vercel.app','https://otobathanh-front-end.vercel.app','https://www.bathanhvn.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
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
app.use('/api/favorites', favoriteRoutes);
app.use('/api/categoriesStaff', categorystaffRoutes);
app.use('/api/staff', staffRoutes);
app.use('/', telegramWebhook);
app.get("/", (req, res) => {
    res.status(200).send("🚀 Bá Thành backend is running.");
});
// MongoDB Connection + Server Start
// mongoose.connect('mongodb://localhost:27017/otobathanh', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('✅ Kết nối MongoDB thành công');
//         server.listen(PORT, () => {
//             console.log(`🚀 Server + Socket.IO đang chạy tại http://localhost:${PORT}`);
//         });
//     })
//     .catch(err => {
//         console.error('❌ Kết nối MongoDB thất bại', err);
//     });

    mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');

    // 👇 FIX: Dùng server.listen thay vì app.listen
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});


