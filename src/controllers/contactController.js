const Contact = require('../models/Contact');
const cloudinary = require('../cloudinary');

// Helper upload 1 ảnh base64
const uploadImage = async (base64) => {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'contacts'
    });
    return result.secure_url;
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
        today.setHours(0, 0, 0, 0); // reset về đầu ngày

        const now = new Date(); // thời điểm hiện tại

        const validTimeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

        // Kiểm tra khung giờ hợp lệ
        if (!validTimeSlots.includes(timeSlot)) {
            return res.status(400).json({ message: 'Khung giờ không hợp lệ.' });
        }

        // Kiểm tra ngày không được là quá khứ
        if (selectedDate < today) {
            return res.status(400).json({ message: 'Không thể đặt lịch cho ngày trong quá khứ.' });
        }

        // Nếu là ngày hôm nay, kiểm tra giờ phải còn trong tương lai
        const isToday = selectedDate.toDateString() === today.toDateString();
        if (isToday) {
            const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
            const selectedSlotTime = new Date(selectedDate); // dùng chính ngày đã chọn
            selectedSlotTime.setHours(slotHour, slotMinute, 0, 0);

            if (selectedSlotTime <= now) {
                return res.status(400).json({ message: 'Không thể đặt khung giờ đã qua của hôm nay.' });
            }
        }

        // Kiểm tra số điện thoại hợp lệ
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(numberPhone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
        }

        // Upload ảnh nếu có
        let imageUrls = [];
        if (images && images.length > 0) {
            imageUrls = await Promise.all(images.map(uploadImage));
        }

        // Tạo mới contact
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
        return res.status(201).json({ message: 'Đặt lịch thành công!', contact: newContact });
    } catch (error) {
        console.error('Lỗi khi đặt lịch:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt lịch.' });
    }
};

// Lấy tất cả contacts
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách liên hệ.' });
    }
};

// Lấy contact theo ID
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

// Cập nhật contact
const updateContact = async (req, res) => {
    try {
        const { images, ...updateData } = req.body;

        if (images && images.length > 0) {
            updateData.images = await Promise.all(images.map(uploadImage));
        }

        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedContact) {
            return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để cập nhật.' });
        }

        res.status(200).json({ message: 'Cập nhật thành công!', contact: updatedContact });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật lịch hẹn.' });
    }
};

// Xóa contact
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
// Đổi trạng thái contact hoặc xóa nếu là cancelled
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }

        if (status === 'cancelled') {
            // Nếu trạng thái là 'cancelled', xóa contact
            const deletedContact = await Contact.findByIdAndDelete(req.params.id);

            if (!deletedContact) {
                return res.status(404).json({ message: 'Không tìm thấy lịch hẹn để xoá.' });
            }

            return res.status(200).json({ message: 'Lịch hẹn đã bị huỷ và xoá thành công!' });
        } else {
            // Nếu trạng thái không phải 'cancelled', chỉ cập nhật trạng thái
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
// Lấy danh sách contact theo khung giờ (mọi ngày)
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
// Lấy danh sách contact theo ngày
const getContactsByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Thiếu ngày.' });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1); // giới hạn trong ngày

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

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    updateContactStatus,
    getContactsByTimeSlot,
    getContactsByDate
};
