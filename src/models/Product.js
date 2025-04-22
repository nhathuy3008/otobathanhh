const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc!'],
    },
    price: {
        type: Number,
        required: [true, 'Giá sản phẩm là bắt buộc!'],
    },
    image: {
        type: String,
        default: null, // Có thể không bắt buộc
    },
    subImages: {
        type: [String], // Mảng các URL hình ảnh phụ
        default: [],
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng là bắt buộc!'],
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Danh mục là bắt buộc!'],
    },
    description: {
        type: String,
        default: '',
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    name_unsigned: {
        type: String,
        index: true, // Tăng tốc tìm kiếm
    },    
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Product', productSchema);
