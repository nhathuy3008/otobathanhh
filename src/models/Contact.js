const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Họ và tên là bắt buộc!'],
    },
    date: {
        type: Date,
        required: [true, 'Ngày đặt lịch là bắt buộc!'],
        validate: {
            validator: function (value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: 'Không thể chọn ngày trong quá khứ!',
        },
    },
    timeSlot: {
        type: String,
        enum: [
            '08:00', '09:00', '10:00', '11:00',
            '13:00', '14:00', '15:00', '16:00'
        ],
        required: [true, 'Khung giờ là bắt buộc!'],
    },
    numberPhone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc!'],
        validate: {
            validator: function (v) {
                return /^0\d{9}$/.test(v); // Ví dụ: 10 số, bắt đầu bằng 0 (Việt Nam)
            },
            message: props => `${props.value} không phải là số điện thoại hợp lệ!`,
        },
    },
    description: {
        type: String,
        default: '',
    },
    images: {
        type: [String],
        default: [],
    },
    updateLogs: [{
        reason: String,
        updatedAt: Date
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
