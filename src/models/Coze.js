const mongoose = require('mongoose');
const { Schema } = mongoose;

const cozeChatSchema = new Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true, // Bắt buộc có người dùng
    },
    sessionId: {
      type: String,
      default: null,
    },
    userMessage: {
      type: String,
      required: [true, 'Tin nhắn người dùng là bắt buộc!'],
    },
    botResponse: {
      type: String,
      required: [true, 'Phản hồi của bot là bắt buộc!'],
    },
    cozeMessageId: {
      type: String,
      default: null, // Lưu ID tin nhắn từ Coze nếu có
    }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

const CozeChat = mongoose.model('CozeChat', cozeChatSchema);

module.exports = CozeChat;
