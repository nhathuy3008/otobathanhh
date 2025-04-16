const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 1, // Số lượng phải lớn hơn hoặc bằng 1
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Liên kết với mô hình Product
      required: true,
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account', // Liên kết với mô hình Account
      required: true,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
