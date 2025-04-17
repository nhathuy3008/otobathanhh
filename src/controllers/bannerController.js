const Banner = require('../models/Banner');
const cloudinary = require('../cloudinary');

// Upload ảnh base64 lên Cloudinary
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'banners',
    });
    return result.secure_url;
};

// Lấy danh sách tất cả banner
const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        return res.status(200).json(banners);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Thêm banner mới
const createBanner = async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'Ảnh banner là bắt buộc' });
        }

        const imageUrl = await uploadImage(image);

        const banner = new Banner({ image: imageUrl });
        await banner.save();

        return res.status(201).json(banner);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật banner
const updateBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const { image } = req.body;
        const updateData = {};

        if (image) {
            const imageUrl = await uploadImage(image);
            updateData.image = imageUrl;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedBanner) {
            return res.status(404).json({ message: 'Banner không tìm thấy' });
        }

        return res.status(200).json(updatedBanner);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa banner
const deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner không tìm thấy' });
        }
        return res.status(200).json({ message: 'Banner đã được xóa thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner
};
