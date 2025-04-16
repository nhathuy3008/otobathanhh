// const mongoose = require('mongoose');
// const validator = require('validator');

// const accountSchema = new mongoose.Schema({
//     fullName: {
//         type: String,
//         required: [true, 'Họ và tên bắt buộc điền']
//     },
//     // email: {
//     //     type: String,
//     //     required: [true, 'Email bắt buộc điền'],
//     //     validate: [validator.isEmail, 'Vui lòng nhập một địa chỉ email hợp lệ']
//     // },
//     email: {
//         type: String,
//         required: function() {
//             return this.type === 'local'; // Chỉ yêu cầu email khi đăng nhập với loại 'local'
//         },
//         validate: [validator.isEmail, 'Vui lòng nhập một địa chỉ email hợp lệ']
//     },
//     password: {
//         type: String,
//         required: function () {
//           return this.type === 'local'; // Chỉ yêu cầu mật khẩu nếu type là 'local'
//         }
//     },
//     image: {
//         type: String,
//         default: null
//     },
//     enabled: {
//         type: Boolean,
//         default: false
//     },
//     status: {
//         type: Boolean,
//         default: true
//     },
//     verificationToken: {
//         type: String,
//         default: null
//     },
//     roles: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Role'
//     }],
//     type: {
//         type: String,
//         enum: ['local', 'google', 'facebook'],  // Thêm 'facebook' vào enum
//         default: 'local'
//     }
// });

// module.exports = mongoose.model('Account', accountSchema);

const mongoose = require('mongoose');
const validator = require('validator');

const accountSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Họ và tên bắt buộc điền']
    },
    email: {
        type: String,
        validate: {
            validator: function (value) {
                // Nếu có thì validate, nếu không thì bỏ qua
                if (!value) return true;
                return validator.isEmail(value);
            },
            message: 'Vui lòng nhập một địa chỉ email hợp lệ'
        },
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: function () {
            return this.type === 'local';
        }
    },
    image: {
        type: String,
        default: null
    },
    enabled: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    verificationToken: {
        type: String,
        default: null
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    type: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    }
});

module.exports = mongoose.model('Account', accountSchema);


