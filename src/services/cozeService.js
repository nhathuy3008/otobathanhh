require('dotenv').config(); // Load biến môi trường
const axios = require('axios');

const COZE_BASE_URL = process.env.COZE_BASE_URL;
const COZE_ACCESS_TOKEN = process.env.COZE_ACCESS_TOKEN;
const COZE_BOT_ID = process.env.COZE_BOT_ID;

const sendMessageToCoze = async (message, userId = 'default-user') => {
    try {
        const response = await axios.post(
            COZE_BASE_URL,
            {
                bot_id: COZE_BOT_ID,
                user: String(userId),
                query: message,
                stream: false
            },
            {
                headers: {
                    Authorization: `Bearer ${COZE_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('==> Raw response:', response.data);
        
        // Check if the response is a string containing event stream format
        if (typeof response.data === 'string' && response.data.includes('event:message')) {
            // Extract the JSON part from the event stream format
            const dataMatch = response.data.match(/data:(.*)/);
            if (dataMatch && dataMatch[1]) {
                const jsonData = JSON.parse(dataMatch[1]);
                console.log('==> Parsed Coze response:', jsonData);
                
                const messages = jsonData.messages;
                if (!Array.isArray(messages) || messages.length === 0) {
                    throw new Error('Bot không trả lời hoặc dữ liệu phản hồi sai định dạng');
                }
                
                // Filter only answer type messages or adjust as needed
                const answerMessages = messages.filter(m => m.type === 'answer');
                return answerMessages.map(m => m.content).join('\n');
            }
        } else if (response.data && response.data.messages) {
            // Handle regular JSON response
            const messages = response.data.messages;
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error('Bot không trả lời hoặc dữ liệu phản hồi sai định dạng');
            }
            
            // Filter only answer type messages or adjust as needed
            const answerMessages = messages.filter(m => m.type === 'answer');
            return answerMessages.map(m => m.content).join('\n');
        }
        
        throw new Error('Không thể phân tích dữ liệu phản hồi từ Coze');

    } catch (error) {
        console.error('Lỗi gọi API Coze:', error.response?.data || error.message);
        throw new Error(error.response?.data?.msg || error.message);
    }
};

module.exports = {
    sendMessageToCoze
};