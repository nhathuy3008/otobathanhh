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

        // Bỏ dấu tiếng Việt để tạo name_unsigned
        const name_unsigned = removeVietnameseTones(data.name);

        // Upload ảnh chính nếu có
        const imageUrl = image ? await uploadImage(image) : null;

        // Upload các ảnh phụ nếu có
        const subImageUrls = subImages && subImages.length > 0
            ? await Promise.all(subImages.map(uploadImage))
            : [];

        // Tạo mới sản phẩm
        const product = new Product({
            ...data,
            name_unsigned,
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
//Tạo hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    return str.normalize('NFD') // tách các dấu
        .replace(/[\u0300-\u036f]/g, '') // xóa dấu
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// Gợi ý hoặc tìm kiếm sản phẩm theo tên
const searchProductsByName = async (req, res) => {
    const { name } = req.query;

    try {
        let products;

        if (!name) {
            // Nếu không nhập tên -> gợi ý 5 sản phẩm mới nhất
            products = await Product.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('category_id');
        } else {
            const unsignedName = removeVietnameseTones(name);

            products = await Product.find({
                name_unsigned: { $regex: unsignedName, $options: 'i' }
            }).populate('category_id');
        }

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).populate('category_id');
        return res.status(200).json(featuredProducts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Cập nhật trạng thái nổi bật cho sản phẩm
const updateFeaturedStatus = async (req, res) => {
    const { id } = req.params;
    const { isFeatured } = req.body;

    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { isFeatured },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        return res.status(200).json({ message: `Đã cập nhật trạng thái nổi bật cho sản phẩm ${product.name}`, product });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const getFeaturedProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ _id: id, isFeatured: true }).populate('category_id');

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm nổi bật không tồn tại' });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProductsByName,
    getFeaturedProducts,
    updateFeaturedStatus,
    getFeaturedProductById
};
