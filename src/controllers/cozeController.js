const { sendMessageToCoze } = require('../services/cozeService');

const handleCozeMessage = async (req, res) => {
    const { message, userId } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Thiếu nội dung tin nhắn' });
    }

    try {
        const reply = await sendMessageToCoze(message, userId || 'guest');
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    handleCozeMessage
};
