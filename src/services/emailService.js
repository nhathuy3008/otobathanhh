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
            rejectUnauthorized: false // Chỉ nên dùng cho môi trường dev
        }
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #fefefe; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #FF6F00; text-align: center; animation: fadeIn 1s ease-in-out;">Xác Thực Tài Khoản</h2>
            <p style="font-size: 16px; color: #333;">Chào bạn,</p>
            <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã đăng ký. Đây là mã xác thực của bạn:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="
                    display: inline-block;
                    background-color: #FF6F00;
                    color: white;
                    padding: 15px 30px;
                    font-size: 24px;
                    font-weight: bold;
                    border-radius: 8px;
                    letter-spacing: 4px;
                    animation: pulse 1.5s infinite;
                ">
                    ${verificationCode}
                </span>
            </div>
            <p style="font-size: 14px; color: #777;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
            <p style="font-size: 14px; color: #777;">Trân trọng,<br/>Đội ngũ hỗ trợ</p>
        </div>

        <style>
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        </style>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã xác thực tài khoản',
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendVerificationEmail };
