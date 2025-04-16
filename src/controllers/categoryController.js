const Category = require('../models/Category');

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
    const { id } = req.params; // ID từ URL
    try {
        const category = await Category.findById(id); // Sử dụng findById
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo danh mục mới
const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body); // Lấy dữ liệu từ body
        await category.save();
        return res.status(201).json(category); // Trả về toàn bộ thông tin danh mục
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        return res.status(200).json(category);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        return res.status(200).json({ message: `Danh mục ${category.name} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};