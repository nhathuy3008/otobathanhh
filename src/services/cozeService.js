const axios = require('axios');

const COZE_BASE_URL = 'https://api.coze.com/open_api/v1/chat';
const COZE_ACCESS_TOKEN = 'pat_aOrzxgLq4bX83y21y0lYpyFDeCxhxJmLhB4CfUcMIoZ0R8U0v7zgwAQHzwjEFdsc';
const COZE_BOT_ID = 'your_bot_id'; // Nhớ thay bằng thật nhé

const sendMessageToCoze = async (message, userId = 'default-user') => {
    try {
        const response = await axios.post(
            COZE_BASE_URL,
            {
                bot_id: COZE_BOT_ID,
                user: userId,
                query: message
            },
            {
                headers: {
                    Authorization: `Bearer ${COZE_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.messages[0]?.content || 'Không có phản hồi từ bot';
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

module.exports = {
    sendMessageToCoze
};
