const Role = require('../models/Role');
const Account = require('../models/Account');
// Lấy tất cả vai trò
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        return res.status(200).json(roles);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy vai trò theo ID
const getRoleById = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Vai trò không tìm thấy' });
        }
        return res.status(200).json(role);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo vai trò mới
const createRole = async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        return res.status(201).json(role);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Cập nhật vai trò
const updateRole = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!role) {
            return res.status(404).json({ message: 'Vai trò không tìm thấy' });
        }
        return res.status(200).json(role);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xóa vai trò
const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            return res.status(404).json({ message: 'Vai trò không tìm thấy' });
        }
        return res.status(200).json({ message: `Vai trò ${role.name} đã được xóa thành công!` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const assignRoleToAccount = async (req, res) => {
    const { accountId, roleId } = req.body;

    try {
        // Kiểm tra tài khoản có tồn tại không
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        // Kiểm tra vai trò có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Vai trò không tồn tại' });
        }

        // Kiểm tra nếu tài khoản đã có vai trò này chưa
        if (account.roles.includes(roleId)) {
            return res.status(400).json({ message: 'Tài khoản đã có vai trò này' });
        }

        // Thêm vai trò vào tài khoản
        account.roles.push(roleId);
        await account.save();

        return res.status(200).json({ message: 'Gán vai trò thành công', account });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Master gỡ vai trò khỏi tài khoản
const removeRoleFromAccount = async (req, res) => {
    const { accountId, roleId } = req.body;

    try {
        // Kiểm tra tài khoản có tồn tại không
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        // Kiểm tra vai trò có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Vai trò không tồn tại' });
        }

        // Kiểm tra xem tài khoản có vai trò này không
        if (!account.roles.includes(roleId)) {
            return res.status(400).json({ message: 'Tài khoản không có vai trò này' });
        }

        // Gỡ vai trò khỏi tài khoản
        account.roles = account.roles.filter(r => r.toString() !== roleId);
        await account.save();

        return res.status(200).json({ message: 'Gỡ vai trò thành công', account });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Khóa tài khoản
const disableAccount = async (req, res) => {
    const { accountId } = req.body;

    try {
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        account.status = false;
        await account.save();

        return res.status(200).json({ message: 'Tài khoản đã bị khóa', account });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi khi khóa tài khoản: ${error.message}` });
    }
};

// Mở khóa tài khoản (status = true)
const enableAccount = async (req, res) => {
    const { accountId } = req.body;

    try {
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        account.status = true;
        await account.save();

        return res.status(200).json({ message: 'Tài khoản đã được mở khóa', account });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi khi mở khóa tài khoản: ${error.message}` });
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToAccount,
    removeRoleFromAccount,
    disableAccount,
    enableAccount
};
