const News = require('../models/News');
const cloudinary = require('../cloudinary'); // Đảm bảo đã cấu hình Cloudinary

// Helper upload 1 ảnh base64 lên Cloudinary
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'news'
    });
    return result.secure_url;  // Trả về URL của ảnh sau khi upload
};

// Lấy tất cả bài viết tin tức
const getAllNews = async (req, res) => {
    try {
        const news = await News.find(); // Lấy tất cả tin tức
        return res.status(200).json(news);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy bài viết tin tức theo ID
const getNewsById = async (req, res) => {
    const { id } = req.params;
    try {
        const news = await News.findById(id); // Lấy tin tức theo ID
        if (!news) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }
        return res.status(200).json(news);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo bài viết tin tức mới
const createNews = async (req, res) => {
    try {
        const { image, ...data } = req.body;

        // Nếu có ảnh, upload lên Cloudinary
        const imageUrl = image ? await uploadImage(image) : null;

        const news = new News({
            ...data,
            image: imageUrl
        });

        await news.save();
        return res.status(201).json(news); // Trả về bài viết mới tạo
    } catch (error) {
        return res.status(400).json({ message: error.message }); // Nếu có lỗi, trả về thông báo lỗi
    }
};

// Cập nhật bài viết tin tức
const updateNews = async (req, res) => {
    const { id } = req.params;
    try {
        const { image, ...data } = req.body;

        // Tạo đối tượng chứa dữ liệu cần cập nhật
        const updateData = { ...data };

        if (image) updateData.image = await uploadImage(image);  // Nếu có ảnh mới, upload lên Cloudinary

        const news = await News.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!news) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }

        return res.status(200).json(news); // Trả về bài viết đã được cập nhật
    } catch (error) {
        return res.status(400).json({ message: error.message }); // Nếu có lỗi, trả về thông báo lỗi
    }
};

// Xóa bài viết tin tức
const deleteNews = async (req, res) => {
    const { id } = req.params;
    try {
        const news = await News.findByIdAndDelete(id); // Xóa bài viết theo ID
        if (!news) {
            return res.status(404).json({ message: 'Bài viết không tìm thấy' });
        }
        return res.status(200).json({ message: `Bài viết ${news.title} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message }); // Nếu có lỗi, trả về thông báo lỗi
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
