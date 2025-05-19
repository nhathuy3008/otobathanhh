const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên là bắt buộc!'],
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc!'],
    },
    position: {
        type: String,
        required: [true, 'Chức vụ là bắt buộc!'],
    },
    image: {
        type: String,
        required: [true, 'Ảnh là bắt buộc!'],
    },
    catestaff_id: {
        type: Schema.Types.ObjectId,
        ref: 'CategoryStaff',
        required: [true, 'Danh mục là bắt buộc!'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
