const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề là bắt buộc!'],
    },
    content: {
        type: String,
        required: [true, 'Nội dung là bắt buộc!'],
    },
    image: {
        type: String,
        default: null // Có thể không bắt buộc
    }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('News', newsSchema);
