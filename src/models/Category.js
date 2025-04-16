const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên danh mục bắt buộc điền']
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);