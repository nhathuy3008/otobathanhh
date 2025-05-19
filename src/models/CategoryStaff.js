const mongoose = require('mongoose');
const { Schema } = mongoose;

const categoryStaffSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên danh mục nhân viên bắt buộc điền']
    }
}, { timestamps: true });

module.exports = mongoose.model('CategoryStaff', categoryStaffSchema);
