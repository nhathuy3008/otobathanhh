const Staff = require('../models/Staff');
const cloudinary = require('../cloudinary');

// Upload ảnh base64 lên Cloudinary
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'staffs'
    });
    return result.secure_url;
};

// Lấy tất cả nhân viên
const getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find().populate('catestaff_id');
        return res.status(200).json(staffList);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy nhân viên theo ID
const getStaffById = async (req, res) => {
    const { id } = req.params;
    try {
        const staff = await Staff.findById(id).populate('catestaff_id');
        if (!staff) return res.status(404).json({ message: 'Nhân viên không tìm thấy' });
        return res.status(200).json(staff);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo nhân viên mới
const createStaff = async (req, res) => {
    try {
        const { image, ...data } = req.body;

        const imageUrl = image ? await uploadImage(image) : null;

        const staff = new Staff({
            ...data,
            image: imageUrl
        });

        await staff.save();
        return res.status(201).json(staff);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật nhân viên
const updateStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const { image, ...data } = req.body;
        const updateData = { ...data };

        if (image) {
            updateData.image = await uploadImage(image);
        }

        const staff = await Staff.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!staff) {
            return res.status(404).json({ message: 'Nhân viên không tìm thấy' });
        }

        return res.status(200).json(staff);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa nhân viên
const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const staff = await Staff.findByIdAndDelete(id);
        if (!staff) {
            return res.status(404).json({ message: 'Nhân viên không tìm thấy' });
        }
        return res.status(200).json({ message: `Nhân viên ${staff.name} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff
};
