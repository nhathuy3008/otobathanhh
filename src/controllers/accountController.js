const Account = require('../models/Account');
const { sendVerificationEmail } = require('../services/emailService');
const bcrypt = require("bcryptjs");
const cloudinary = require('../cloudinary');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Tạo tài khoản
const createAccount = async (req, res) => {
    const { fullName, email, password, image } = req.body;

    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
        return res.status(400).send('Email này đã được sử dụng.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo mã xác thực 6 số ngẫu nhiên
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newAccount = new Account({
        fullName,
        email,
        password: hashedPassword,
        verificationToken: verificationCode, // Lưu mã xác thực vào trường verificationToken
        enabled: false     // Mặc định là không xác thực
    });

    if (image) {
        try {
            let uploadedImage;
            if (image.startsWith("data:")) {
                uploadedImage = await uploadImageToCloudinary(image);
            } else {
                const base64Image = await convertImageUrlToBase64(image);
                uploadedImage = await uploadImageToCloudinary(base64Image);
            }
            newAccount.image = uploadedImage;
        } catch (error) {
            return res.status(500).send('Đã xảy ra lỗi khi tải lên ảnh.');
        }
    }

    await newAccount.save();

    try {
        await sendVerificationEmail(email, verificationCode); // Gửi mã xác thực
        res.status(201).send('Tài khoản đã được tạo. Vui lòng kiểm tra email để nhận mã xác thực.');
    } catch (error) {
        return res.status(500).send('Đã xảy ra lỗi khi gửi email xác thực.');
    }
};
// Xác thực tài khoản
const verifyAccount = async (req, res) => {
    const { email, code } = req.body; // Lấy email và mã từ body

    try {
        const account = await Account.findOne({ email });

        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        // Kiểm tra mã xác thực
        if (account.verificationToken === code) {
            account.enabled = true; // Kích hoạt tài khoản
            account.verificationToken = null; // Xóa mã xác thực
            await account.save();
            return res.status(200).json({
                status: "thành công",
                message: "Tài khoản đã được xác thực thành công!"
            });
        } else {
            return res.status(400).json({
                status: "thất bại",
                message: "Mã xác thực không đúng."
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi xác thực tài khoản."
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const account = await Account.findOne({ email }).populate('roles');

        if (!account) {
            return res.status(401).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại hoặc chưa được xác thực."
            });
        }

        if (!account.enabled) {
            return res.status(401).json({
                status: "thất bại",
                message: "Tài khoản chưa được xác thực."
            });
        }

        if (!account.status) {
            return res.status(403).json({
                status: "thất bại",
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để mở khóa."
            });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "thất bại",
                message: "Mật khẩu không đúng."
            });
        }

        // Tạo token nếu đăng nhập thành công
        const token = jwt.sign(
            { id: account._id, roles: account.roles.map(role => role.name) },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            id: account._id,
            fullName: account.fullName,
            image: account.image,
            token,
            message: "Đăng nhập thành công",
            status: "thành công"
        });

    } catch (error) {
        res.status(500).json({
            status: "lỗi",
            message: "Lỗi máy chủ",
            error: error.message
        });
    }
};


// Lấy thông tin tài khoản theo ID
const getAccountById = async (req, res) => {
    const { id } = req.params;

    try {
        const account = await Account.findById(id).populate('roles');

        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        res.status(200).json({
            status: "thành công",
            account
        });
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi lấy thông tin tài khoản."
        });
    }
};

// Lấy tất cả tài khoản
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().populate('roles')
        res.status(200).json(accounts);
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi lấy danh sách tài khoản."
        });
    }
};

const convertImageUrlToBase64 = async (url) => {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};
// Chức năng cập nhật tài khoản
const updateAccount = async (req, res) => {
    const { id } = req.params;
    const { fullName, password, image } = req.body;

    try {
        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ status: "thất bại", message: "Tài khoản không tồn tại." });
        }

        // Cập nhật tên đầy đủ
        if (fullName) {
            account.fullName = fullName;
        }

        // Cập nhật mật khẩu
        if (password) {
            account.password = await bcrypt.hash(password, 10);
        }

        // Xử lý ảnh nếu có
        if (image) {
            try {
                let uploadedImage;
                if (image.startsWith("data:")) {
                    // Nếu là base64
                    uploadedImage = await uploadImageToCloudinary(image);
                } else {
                    // Nếu là URL thì convert sang base64 trước
                    const base64Image = await convertImageUrlToBase64(image);
                    uploadedImage = await uploadImageToCloudinary(base64Image);
                }
                account.image = uploadedImage;
            } catch (error) {
                console.error('Image upload error:', error);
                return res.status(500).json({ status: "thất bại", message: "Đã xảy ra lỗi khi tải lên hình ảnh." });
            }
        }

        // Lưu tài khoản đã cập nhật
        const updatedAccount = await account.save();
        res.status(200).json({
            status: "thành công",
            message: "Cập nhật tài khoản thành công!",
            account: updatedAccount
        });
    } catch (error) {
        console.error('Error updating account:', error);
        return res.status(500).json({ status: "thất bại", message: "Đã xảy ra lỗi khi cập nhật tài khoản." });
    }
};


// Chức năng upload hình ảnh lên Cloudinary
const uploadImageToCloudinary = async (base64Image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(base64Image, { resource_type: 'image' }, (error, result) => {
            if (error) {
                console.error('Error uploading to Cloudinary:', error);
                return reject(error);
            }
            resolve(result.secure_url);
        });
    });
};

// Xác thực mật khẩu
const validatePassword = async (req, res) => {
    const { id } = req.query;
    const oldPassword = req.query.oldPassword;

    try {
        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        // Kiểm tra mật khẩu
        const isValid = await bcrypt.compare(oldPassword, account.password);
        if (isValid) {
            return res.status(200).json({
                message: "Mật khẩu hợp lệ",
                status: "thành công"
            });
        } else {
            return res.status(400).json({
                message: "Mật khẩu cũ không hợp lệ",
                status: "lỗi"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi xác thực mật khẩu."
        });
    }
};
// Gửi mã xác minh để đặt lại mật khẩu
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Email không tồn tại."
            });
        }

        // Tạo mã xác minh ngẫu nhiên
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        account.verificationToken = resetCode; // Lưu mã xác minh vào tài khoản
        await account.save();

        await sendVerificationEmail(email, resetCode); // Gửi email chứa mã xác minh
        res.status(200).json({
            status: "thành công",
            message: "Mã xác minh đã được gửi đến email của bạn."
        });
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi gửi mã xác minh."
        });
    }
};

// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    const { email, verificationCode, newPassword } = req.body;

    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        // Kiểm tra mã xác minh trong cơ sở dữ liệu
        if (account.verificationToken !== verificationCode) {
            return res.status(400).json({
                status: "thất bại",
                message: "Mã xác minh không hợp lệ."
            });
        }

        // Cập nhật mật khẩu
        account.password = await bcrypt.hash(newPassword, 10);
        account.verificationToken = null; // Xóa mã xác minh sau khi đã sử dụng
        await account.save();

        res.status(200).json({
            status: "thành công",
            message: "Mật khẩu đã được thay đổi thành công."
        });
    } catch (error) {
        console.error(error); // Log lỗi để kiểm tra
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi đặt lại mật khẩu."
        });
    }
};
// Xác minh mã xác nhận
const verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body; // Lấy email và mã từ body

    try {
        const account = await Account.findOne({ email });

        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        // Kiểm tra mã xác minh
        if (account.verificationToken === verificationCode) {
            account.enabled = true; // Kích hoạt tài khoản
            account.verificationToken = null; // Xóa mã xác thực
            await account.save();
            return res.status(200).json({
                status: "thành công",
                message: "Tài khoản đã được xác thực thành công!"
            });
        } else {
            return res.status(400).json({
                status: "thất bại",
                message: "Mã xác thực không đúng."
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi xác thực tài khoản."
        });
    }
};
const googleLogin = async (req, res) => {
    try {
        const user = req.user;

        // Tạo JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Đăng nhập Google thành công',
            token,
            user
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi đăng nhập bằng Google', error: err.message });
    }
};
const facebookLogin = async (req, res) => {
    try {
        const user = req.user;

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Đăng nhập Facebook thành công',
            token,
            user
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi đăng nhập Facebook', error: err.message });
    }
};
// Xóa tài khoản
const deleteAccount = async (req, res) => {
    const { id } = req.params;

    console.log("ID nhận được từ request:", id); // Kiểm tra ID trong console

    try {
        const account = await Account.findByIdAndDelete(id);
        if (!account) {
            return res.status(404).json({
                status: "thất bại",
                message: "Tài khoản không tồn tại."
            });
        }

        res.status(200).json({
            status: "thành công",
            message: "Tài khoản đã được xóa thành công."
        });
    } catch (error) {
        console.error("Lỗi khi xóa tài khoản:", error);
        res.status(500).json({
            status: "thất bại",
            message: "Đã xảy ra lỗi khi xóa tài khoản."
        });
    }
};
module.exports = {
    createAccount,
    verifyAccount,
    login,
    getAllAccounts,
    getAccountById,
    updateAccount,
    validatePassword,
    forgotPassword,
    resetPassword,
    verifyCode,
    googleLogin,
    facebookLogin,
    deleteAccount
};