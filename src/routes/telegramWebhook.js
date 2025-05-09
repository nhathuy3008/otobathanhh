const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const axios = require('axios');
const mongoose = require('mongoose');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

router.post('/telegram-webhook', async (req, res) => {
    try {
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('❌ Missing TELEGRAM_BOT_TOKEN');
            return res.sendStatus(500);
        }

        const body = req.body;

        console.log('🔔 Received telegram webhook:', JSON.stringify(body, null, 2));

        if (body.callback_query) {
            const callback = body.callback_query;
            const data = callback.data;

            if (!data) {
                console.error('❌ Missing callback data');
                return res.sendStatus(400);
            }

            // ✅ CHẤP NHẬN
            if (data.startsWith('accept_')) {
                const contactId = data.replace('accept_', '');
                console.log('📌 Chấp nhận contactId:', contactId);

                if (!mongoose.Types.ObjectId.isValid(contactId)) {
                    console.error('❌ Invalid contactId format:', contactId);
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ ID lịch hẹn không hợp lệ.",
                        show_alert: true
                    });
                    return res.sendStatus(400);
                }

                try {
                    const contact = await Contact.findById(contactId);
                    
                    if (!contact) {
                        console.warn('⚠️ Không tìm thấy contact ID:', contactId);
                        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                            callback_query_id: callback.id,
                            text: "❌ Không tìm thấy lịch hẹn hoặc đã bị xoá.",
                            show_alert: true
                        });
                        return res.sendStatus(404);
                    }
                    
                    // Cập nhật trạng thái
                    contact.status = 'confirmed';
                    await contact.save();
                    
                    console.log('✅ Contact được xác nhận:', contact);

                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "✅ Lịch hẹn đã được chấp nhận.",
                        show_alert: false
                    });

                    const tgResp = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                        chat_id: callback.message.chat.id,
                        message_id: callback.message.message_id,
                        text: `✅ *Lịch hẹn đã được xác nhận!*\n\n👤 Họ tên: *${contact.fullName}*\n📅 Ngày: *${new Date(contact.date).toLocaleDateString('vi-VN')}*\n🕘 Giờ: *${contact.timeSlot}*`,
                        parse_mode: 'Markdown'
                    });

                    console.log('📤 Telegram editMessageText response:', tgResp.data);
                } catch (error) {
                    console.error('❌ Lỗi khi xử lý chấp nhận:', error);
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ Đã xảy ra lỗi khi xử lý.",
                        show_alert: true
                    });
                    return res.sendStatus(500);
                }
            }

            // ❌ TỪ CHỐI
            else if (data.startsWith('reject_')) {
                const contactId = data.replace('reject_', '');
                console.log('📌 Từ chối contactId:', contactId);

                if (!mongoose.Types.ObjectId.isValid(contactId)) {
                    console.error('❌ Invalid contactId format:', contactId);
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ ID lịch hẹn không hợp lệ.",
                        show_alert: true
                    });
                    return res.sendStatus(400);
                }

                try {
                    const contact = await Contact.findById(contactId);
                    
                    if (!contact) {
                        console.warn('⚠️ Không tìm thấy contact ID:', contactId);
                        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                            callback_query_id: callback.id,
                            text: "❌ Không tìm thấy lịch hẹn hoặc đã bị xoá.",
                            show_alert: true
                        });
                        return res.sendStatus(404);
                    }
                    
                    // Cập nhật trạng thái trước khi xóa
                    contact.status = 'cancelled';
                    await contact.save();
                    
                    // Lưu lại thông tin trước khi xóa
                    const contactInfo = {
                        fullName: contact.fullName,
                        date: contact.date,
                        timeSlot: contact.timeSlot
                    };
                    
                    // Xóa contact
                    await Contact.findByIdAndDelete(contactId);

                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ Lịch hẹn đã bị từ chối và xoá.",
                        show_alert: false
                    });

                    const tgResp = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                        chat_id: callback.message.chat.id,
                        message_id: callback.message.message_id,
                        text: `❌ *Lịch hẹn đã bị từ chối và xoá!*\n\n👤 Họ tên: *${contactInfo.fullName}*\n📅 Ngày: *${new Date(contactInfo.date).toLocaleDateString('vi-VN')}*\n🕘 Giờ: *${contactInfo.timeSlot}*`,
                        parse_mode: 'Markdown'
                    });

                    console.log('📤 Telegram editMessageText response:', tgResp.data);
                } catch (error) {
                    console.error('❌ Lỗi khi xử lý từ chối:', error);
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callback.id,
                        text: "❌ Đã xảy ra lỗi khi xử lý.",
                        show_alert: true
                    });
                    return res.sendStatus(500);
                }
            }
            else {
                console.warn('⚠️ Không xác định được loại callback:', data);
                return res.sendStatus(400);
            }
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('❌ Lỗi xử lý webhook:', error);
        return res.sendStatus(500);
    }
});

module.exports = router;