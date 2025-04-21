const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Account = require('../models/Account');
const Product = require('../models/Product'); // ✅ Thay đổi từ Song thành Product

// Thích sản phẩm
const likeProduct = async (req, res) => {
    try {
        const { accountId, productId } = req.body;

        // Kiểm tra xem đã thích sản phẩm chưa
        const existingFavorite = await Favorite.findOne({ account: accountId, product: productId });
        if (existingFavorite) {
            return res.status(400).json({ message: 'Bạn đã thích sản phẩm này rồi.' });
        }

        // Tạo mục yêu thích
        const favorite = new Favorite({
            account: accountId,
            product: productId
        });

        // Lưu vào cơ sở dữ liệu
        await favorite.save();

        // Cập nhật số lượt thích cho sản phẩm
        await Product.findByIdAndUpdate(productId, { $inc: { likeCount: 1 } });

        return res.status(200).json(favorite);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách sản phẩm yêu thích theo tài khoản
const getFavoriteProducts = async (req, res) => {
    try {
        const { accountId } = req.params;

        // Lấy danh sách yêu thích, populate product
        const favorites = await Favorite.find({ account: accountId }).populate('product');

        // Lọc bỏ các favorite có product là null (bị xóa)
        const favoriteProducts = favorites
            .filter(fav => fav.product !== null)
            .map(fav => fav.product);

        return res.status(200).json(favoriteProducts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Đếm số lượt thích cho sản phẩm
const countLikesForProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const likeCount = await Favorite.countDocuments({ product: productId });

        console.log(`Tổng lượt thích cho sản phẩm với ID ${productId}: ${likeCount}`);

        return res.status(200).json(likeCount);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

// Hủy thích sản phẩm
const unlikeProduct = async (req, res) => {
    try {
        const { accountId, productId } = req.params;

        const accountObjectId = new mongoose.Types.ObjectId(accountId);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const result = await Favorite.deleteOne({ account: accountObjectId, product: productObjectId });

        if (result.deletedCount > 0) {
            await Product.findByIdAndUpdate(productObjectId, { $inc: { likeCount: -1 } });
            return res.status(200).json("Bạn đã hủy thích sản phẩm này.");
        } else {
            return res.status(200).json("Bạn chưa thích sản phẩm này.");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

// Kiểm tra xem sản phẩm có được thích hay không
const isProductLiked = async (req, res) => {
    try {
        const { accountId, productId } = req.params;

        const isLiked = await Favorite.exists({ account: accountId, product: productId });

        return res.status(200).json(!!isLiked);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    likeProduct,
    getFavoriteProducts,
    countLikesForProduct,
    unlikeProduct,
    isProductLiked,
};
