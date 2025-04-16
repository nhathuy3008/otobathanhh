const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const verifyRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(403).json({ message: 'Không có token, quyền truy cập bị từ chối!' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const account = await Account.findById(decoded.id).populate('roles');
            if (!account) {
                return res.status(403).json({ message: 'Tài khoản không tồn tại!' });
            }

            const hasPermission = account.roles.some(role =>
                allowedRoles.includes(role.name.toLowerCase())
            );

            if (!hasPermission) {
                return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này!' });
            }

            req.user = account;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Xác thực thất bại!' });
        }
    };
};

module.exports = verifyRole;
