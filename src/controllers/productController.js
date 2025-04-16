const Product = require('../models/Product');
const cloudinary = require('../cloudinary');
// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category_id');
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('category_id');
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Helper upload 1 ảnh base64
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'products'
    });
    return result.secure_url;
};

// Tạo sản phẩm
const createProduct = async (req, res) => {
    try {
        const { image, subImages, ...data } = req.body;

        const imageUrl = image ? await uploadImage(image) : null;
        const subImageUrls = subImages && subImages.length > 0
            ? await Promise.all(subImages.map(uploadImage))
            : [];

        const product = new Product({
            ...data,
            image: imageUrl,
            subImages: subImageUrls
        });

        await product.save();
        return res.status(201).json(product);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { image, subImages, ...data } = req.body;

        const updateData = { ...data };

        if (image) updateData.image = await uploadImage(image);
        if (subImages && subImages.length > 0)
            updateData.subImages = await Promise.all(subImages.map(uploadImage));

        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }
        return res.status(200).json({ message: `Sản phẩm ${product.name} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
