const Comment = require('../models/Comment');

const requireRoleOrSelf = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const commentId = req.params.id;

            // Tìm bình luận
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Bình luận không tồn tại!' });
            }

            // Tránh lỗi nếu user.roles bị null hoặc không phải mảng
            const userRoles = Array.isArray(user.roles) ? user.roles : [];

            const hasRole = userRoles.some(role =>
                allowedRoles.includes(role.name?.toLowerCase())
            );

            const isOwner = comment.account.toString() === user._id.toString();

            if (!hasRole && !isOwner) {
                return res.status(403).json({ message: 'Bạn không có quyền xoá bình luận này!' });
            }

            // Đính kèm comment cho controller dùng
            req.comment = comment;

            next();
        } catch (error) {
            console.error("❌ Lỗi kiểm tra quyền:", error);
            return res.status(500).json({ message: 'Lỗi kiểm tra quyền truy cập.' });
        }
    };
};

module.exports = requireRoleOrSelf;
