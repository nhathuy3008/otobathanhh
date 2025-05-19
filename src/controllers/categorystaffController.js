const CategoryStaff = require('../models/CategoryStaff');

// Lấy tất cả danh mục nhân viên
const getAllCategoryStaffs = async (req, res) => {
    try {
        const categoryStaffs = await CategoryStaff.find();
        return res.status(200).json(categoryStaffs);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh mục nhân viên theo ID
const getCategoryStaffById = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryStaff = await CategoryStaff.findById(id);
        if (!categoryStaff) {
            return res.status(404).json({ message: 'Danh mục nhân viên không tìm thấy' });
        }
        return res.status(200).json(categoryStaff);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo danh mục nhân viên mới
const createCategoryStaff = async (req, res) => {
    try {
        const categoryStaff = new CategoryStaff(req.body);
        await categoryStaff.save();
        return res.status(201).json(categoryStaff);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật danh mục nhân viên
const updateCategoryStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryStaff = await CategoryStaff.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        if (!categoryStaff) {
            return res.status(404).json({ message: 'Danh mục nhân viên không tìm thấy' });
        }
        return res.status(200).json(categoryStaff);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa danh mục nhân viên
const deleteCategoryStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryStaff = await CategoryStaff.findByIdAndDelete(id);
        if (!categoryStaff) {
            return res.status(404).json({ message: 'Danh mục nhân viên không tìm thấy' });
        }
        return res.status(200).json({ message: `Danh mục nhân viên ${categoryStaff.name} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCategoryStaffs,
    getCategoryStaffById,
    createCategoryStaff,
    updateCategoryStaff,
    deleteCategoryStaff
};
