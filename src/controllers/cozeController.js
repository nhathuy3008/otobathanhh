// const { sendMessageToCoze } = require('../services/cozeService');

// const handleCozeMessage = async (req, res) => {
//     const { message, userId } = req.body;

//     if (!message || typeof message !== 'string') {
//         return res.status(400).json({ message: 'Thiếu hoặc sai định dạng nội dung tin nhắn' });
//     }

//     const user = userId ? String(userId) : 'guest';

//     try {
//         const reply = await sendMessageToCoze(message, user);
//         return res.status(200).json({ reply });
//     } catch (error) {
//         console.error('[Coze API Error]', error); // 👈 Ghi log đầy đủ
//         return res.status(500).json({ message: 'Lỗi khi phản hồi từ bot' });
//     }
// };

// module.exports = {
//     handleCozeMessage
// };
const { sendMessageToCoze } = require('../services/cozeService');
const CozeChat = require('../models/Coze');
const mongoose = require('mongoose');

/**
 * Xử lý tin nhắn gửi đến bot và trả lại phản hồi
 */
const handleCozeMessage = async (req, res) => {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Thiếu hoặc sai định dạng nội dung tin nhắn' });
    }

    const accountId = mongoose.Types.ObjectId.isValid(userId) ? userId : null;

    try {
        const botReply = await sendMessageToCoze(message, userId || 'guest');

        // ✅ Lưu lịch sử chat nếu có user hợp lệ
        await CozeChat.create({
            account_id: accountId,
            userMessage: message,
            botResponse: botReply,
        });

        return res.status(200).json({
            message: 'Thành công',
            originalMessage: message,
            botReply
        });

    } catch (error) {
        console.error('[Coze API Error]', error);
        return res.status(500).json({ message: 'Lỗi khi phản hồi từ bot', error: error.message });
    }
};

module.exports = {
    handleCozeMessage
};
