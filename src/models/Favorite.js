const mongoose = require('mongoose');
const { Schema } = mongoose;

// Định nghĩa mô hình Favorite
const favoriteSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account', // Tham chiếu đến mô hình Account
        required: true, // Bắt buộc nếu cần
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Tham chiếu đến mô hình Song
        required: true, // Bắt buộc nếu cần
    },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Favorite', favoriteSchema);