const nodemailer = require('nodemailer');
require('dotenv').config(); // Nạp biến môi trường từ tệp .env

const sendVerificationEmail = async (email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Chỉ nên dùng cho phát triển
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã xác thực tài khoản',
        text: `Mã xác thực của bạn là: ${verificationCode}. Vui lòng nhập mã này để xác thực tài khoản của bạn.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendVerificationEmail };