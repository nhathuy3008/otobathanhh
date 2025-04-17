const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema({
    image: {
        type: String,
        required: [true, 'Ảnh banner là bắt buộc']
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
