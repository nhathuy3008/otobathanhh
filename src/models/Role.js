const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên vai trò là bắt buộc'],
        unique: true
    }
});

module.exports = mongoose.model('Role', roleSchema);
