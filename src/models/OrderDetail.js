const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);  // Đảm bảo sử dụng đúng model

module.exports = OrderDetail;
