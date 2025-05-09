const Contact = require('../models/Contact');
const cloudinary = require('../cloudinary');
const axios = require('axios');

// Telegram config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Helper upload 1 ảnh base64
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'contacts'
    });
    return result.secure_url;
};
// Gửi tin nhắn Telegram
const sendTelegramMessage = async (contact) => {
    const message = `
✨ *Lịch hẹn mới!* ✨
👤 *Tên:* ${contact.fullName}
📅 *Ngày:* ${new Date(contact.date).toLocaleDateString('vi-VN')}
🕘 *Giờ:* ${contact.timeSlot}
📱 *SĐT:* ${contact.numberPhone}
📝 *Ghi chú:* ${contact.description || 'Không có'}

💬 *Hãy chọn hành động:* 
`;

    try {
        // Gửi tin nhắn chính
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Chấp nhận', callback_data: `accept_${contact._id}` },
                        { text: '❌ Từ chối', callback_data: `reject_${contact._id}` }
                    ]
                ]
            }
        });

        // Gửi ảnh
        if (Array.isArray(contact.images)) {
            for (const [index, url] of contact.images.entries()) {
                try {
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                        chat_id: TELEGRAM_CHAT_ID,
                        photo: url,
                        caption: index === 0 ? `📸 Ảnh từ ${contact.fullName}` : undefined
                    });
                } catch (error) {
                    console.error('Gửi ảnh thất bại:', error.response?.data || error.message);
                }
            }
        }

        // Gửi GIF nếu có
        if (Array.isArray(contact.gif)) {
            for (const gifUrl of contact.gif) {
                try {
                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`, {
                        chat_id: TELEGRAM_CHAT_ID,
                        animation: gifUrl,
                        caption: `🎬 Ảnh động từ ${contact.fullName}`
                    });
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('Gửi ảnh động thất bại:', error.message);
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn Telegram:', error.message);
    }
};
// Tạo mới contact
const createContact = async (req, res) => {
    try {
        const {
            fullName,
            date,
            timeSlot,
            numberPhone,
            description,
            images
        } = req.body;

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();

        const validTimeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
        if (!validTimeSlots.includes(timeSlot)) {
            return res.status(400).json({ message: 'Khung giờ không hợp lệ.' });
        }

        if (selectedDate < today) {
            return res.status(400).json({ message: 'Không thể đặt lịch cho ngày trong quá khứ.' });
        }

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 7);
        if (selectedDate > maxDate) {
            return res.status(400).json({ message: 'Chỉ được đặt lịch trong vòng 7 ngày tới.' });
        }

        const isToday = selectedDate.toDateString() === today.toDateString();
        if (isToday) {
            const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
            const selectedSlotTime = new Date(selectedDate);
            selectedSlotTime.setHours(slotHour, slotMinute, 0, 0);
            if (selectedSlotTime <= now) {
                return res.status(400).json({ message: 'Không thể đặt khung giờ đã qua của hôm nay.' });
            }
        }

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(numberPhone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
        }

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const MAX_BOOKINGS_PER_SLOT = 5;
        const existingBookings = await Contact.countDocuments({
            date: { $gte: startOfDay, $lte: endOfDay },
            timeSlot: timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBookings >= MAX_BOOKINGS_PER_SLOT) {
            return res.status(400).json({ message: 'Khung giờ này đã đầy, vui lòng chọn khung giờ khác.' });
        }

        // Upload ảnh song song
        let imageUrls = [];
        if (Array.isArray(images)) {
            const uploadPromises = images.map(async (base64) => {
                try {
                    const uploaded = await uploadImage(base64);
                    return uploaded.replace('/upload/', '/upload/w_1000,q_70/');
                } catch (err) {
                    console.error('Upload ảnh thất bại:', err.message);
                    return null;
                }
            });
            const results = await Promise.all(uploadPromises);
            imageUrls = results.filter(url => url !== null);
        }

        const newContact = new Contact({
            fullName,
            date: selectedDate,
            timeSlot,
            numberPhone,
            description,
            images: imageUrls,
            status: 'pending'
        });

        await newContact.save();

        // Trả kết quả ngay
        res.status(201).json({ message: 'Đặt lịch thành công!', contact: newContact });

        // Gửi Telegram chạy nền
        sendTelegramMessage(newContact).catch(err => {
            console.error('Lỗi khi gửi Telegram:', err.message);
        });

    } catch (error) {
        console.error('Lỗi khi đặt lịch:', error.message, error.stack);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt lịch.', error: error.message });
    }
};
// Các hàm khác giữ nguyên
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách liên hệ.' });
    }
};
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết lịch hẹn.' });
    }
};
const updateContact = async (req, res) => {
    try {
        const { updateReason, images, ...updateData } = req.body;

        if (!updateReason || updateReason.trim() === '') {
            return res.status(400).json({ message: 'Vui lòng cung cấp lý do cập nhật lịch hẹn.' });
        }

        const currentContact = await Contact.findById(req.params.id);
        if (!currentContact) {
            return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để cập nhật.' });
        }

        if (currentContact.status === 'confirmed') {
            return res.status(400).json({ message: 'Lịch hẹn đã được xác nhận, không thể cập nhật.' });
        }

        // Kiểm tra giới hạn ngày
        if (updateData.date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const maxDate = new Date(today);
            maxDate.setDate(today.getDate() + 7);

            const selectedDate = new Date(updateData.date);
            if (selectedDate > maxDate) {
                return res.status(400).json({ message: 'Ngày đặt lịch không được quá 7 ngày từ hôm nay.' });
            }
        }

        if (images && images.length > 0) {
            updateData.images = await Promise.all(images.map(uploadImage));
        }

        Object.assign(currentContact, updateData);

        currentContact.updateLogs.push({
            reason: updateReason,
            updatedAt: new Date(),
        });

        await currentContact.save();

        res.status(200).json({ message: 'Cập nhật thành công!', contact: currentContact });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật lịch hẹn.' });
    }
};
const deleteContact = async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để xoá.' });
        }
        res.status(200).json({ message: 'Xoá lịch hẹn thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xoá lịch hẹn.' });
    }
};
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }

        if (status === 'cancelled') {
            const deletedContact = await Contact.findByIdAndDelete(req.params.id);
            if (!deletedContact) {
                return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để xoá.' });
            }
            return res.status(200).json({ message: 'Lịch hẹn đã bị huỷ và xoá thành công!' });
        } else {
            const updatedContact = await Contact.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );

            if (!updatedContact) {
                return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để cập nhật trạng thái.' });
            }

            return res.status(200).json({
                message: `Cập nhật trạng thái thành công!`,
                contact: updatedContact
            });
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái.' });
    }
};
const getContactsByTimeSlot = async (req, res) => {
    try {
        const { timeSlot } = req.query;
        if (!timeSlot) {
            return res.status(400).json({ message: 'Thiếu khung giờ.' });
        }

        const contacts = await Contact.find({ timeSlot }).sort({ date: 1, createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Lỗi khi lấy theo khung giờ:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};
const getContactsByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Thiếu ngày.' });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const contacts = await Contact.find({
            date: {
                $gte: selectedDate,
                $lt: nextDate
            }
        }).sort({ timeSlot: 1, createdAt: -1 });

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Lỗi khi lấy theo ngày:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};
const getMonthlyContactCount = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Thiếu tháng hoặc năm.' });
        }

        const startDate = new Date(year, month - 1, 1); // Bắt đầu từ ngày đầu tháng
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Ngày cuối cùng của tháng

        const count = await Contact.countDocuments({
            date: { $gte: startDate, $lte: endDate }
        });

        return res.status(200).json({
            message: `Tổng số lịch hẹn trong tháng ${month}/${year}`,
            count
        });
    } catch (error) {
        console.error('Lỗi khi tính tổng lịch hẹn theo tháng:', error);
        return res.status(500).json({ message: 'Lỗi server.' });
    }
};
module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    updateContactStatus,
    getContactsByTimeSlot,
    getContactsByDate,
    getMonthlyContactCount
};
