const { sendMessageToCoze } = require('../services/cozeService');

const handleCozeMessage = async (req, res) => {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Thiếu hoặc sai định dạng nội dung tin nhắn' });
    }

    const user = userId ? String(userId) : 'guest';

    try {
        const reply = await sendMessageToCoze(message, user);
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('[Coze API Error]', error); // 👈 Ghi log đầy đủ
        return res.status(500).json({ message: 'Lỗi khi phản hồi từ bot' });
    }
};

module.exports = {
    handleCozeMessage
};
