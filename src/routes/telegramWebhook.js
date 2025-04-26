// routes/telegramWebhook.js

const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const axios = require('axios');
const mongoose = require('mongoose');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

router.post('/telegram-webhook', async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('❌ Missing TELEGRAM_BOT_TOKEN');
        return res.sendStatus(500);
    }

    const body = req.body;

    // Kiểm tra callback query (nút bấm từ người dùng)
    if (body.callback_query) {
        const callback = body.callback_query;
        const data = callback.data;

        if (data.startsWith('accept_')) {
            const contactId = data.replace('accept_', '');
            // Xử lý "Chấp nhận"...
        }

        if (data.startsWith('reject_')) {
            const contactId = data.replace('reject_', '');

            // Kiểm tra ID hợp lệ
            if (!mongoose.Types.ObjectId.isValid(contactId)) {
                return res.sendStatus(400);
            }

            try {
                // Cập nhật trạng thái contact thành "cancelled" và xóa contact
                const contact = await Contact.findByIdAndUpdate(
                    contactId,
                    { status: 'cancelled' },
                    { new: true }
                );

                if (contact) {
                    // Xóa contact khỏi cơ sở dữ liệu
                    await Contact.findByIdAndDelete(contactId);

                    // Trả lời callback để tránh spinner loading
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ Lịch hẹn đã bị từ chối và xoá.",
                        show_alert: false
                    });

                    // Cập nhật lại nội dung tin nhắn đã gửi kèm nút
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                        chat_id: callback.message.chat.id,
                        message_id: callback.message.message_id,
                        text: `❌ *Lịch hẹn đã bị từ chối và xoá!*\n\n👤 Họ tên: *${contact.fullName}*\n📅 Ngày: *${new Date(contact.date).toLocaleDateString('vi-VN')}*\n🕘 Giờ: *${contact.timeSlot}*`,
                        parse_mode: 'Markdown'
                    });
                } else {
                    // Không tìm thấy lịch hẹn
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ Không tìm thấy lịch hẹn hoặc đã bị xóa.",
                        show_alert: true
                    });
                }
            } catch (error) {
                console.error('❌ Lỗi khi xử lý callback:', error.message);
                return res.sendStatus(500);
            }
        }
    }

    // Trả về 200 để Telegram không retry
    res.sendStatus(200);
});



module.exports = router;
