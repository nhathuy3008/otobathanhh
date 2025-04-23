const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^0\d{9}$/.test(v); // Định dạng SĐT Việt Nam: 10 chữ số, bắt đầu bằng 0
        },
        message: props => `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment_method: {
      type: String,
      enum: ['COD', 'Banking', 'Momo', 'ZaloPay', 'VNPAY'], // ➕ Thêm 'VNPAY'
      default: 'COD',
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v); // Định dạng email cơ bản
        },
        message: props => `${props.value} không phải là địa chỉ email hợp lệ!`,
      },
    },
  },
  
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
