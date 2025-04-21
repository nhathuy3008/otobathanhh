require('dotenv').config(); // 👈 Đảm bảo load biến môi trường
const axios = require('axios');

const Account = require('../models/Account');
const Product = require('../models/Product');
const Comment = require('../models/Comment');

// Kiểm tra model load đúng chưa
console.log("🧪 Comment model name thực sự là:", Comment.modelName); // Phải in ra 'Comment'
console.log("🧠 Comment schema paths:", Object.keys(Comment.schema.paths)); 

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/unitary/toxic-bert";
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

// 🟢 Tạo bình luận mới
const createComment = async (req, res) => {
    try {
        const { comment, accountId, productId } = req.body; 

        // Kiểm tra các tham số bắt buộc
        if (!comment || !accountId || !productId) { 
            return res.status(400).json({ message: "Thiếu thông tin comment, accountId hoặc productId." });
        }

        // Kiểm tra tài khoản người dùng
        const userAccount = await Account.findById(accountId);
        if (!userAccount) {
            return res.status(400).json({ message: "Người dùng không tồn tại." });
        }

        // Kiểm tra sản phẩm
        const productRecord = await Product.findById(productId); 
        if (!productRecord) {
            return res.status(400).json({ message: "Sản phẩm không tồn tại." }); 
        }

        // Kiểm tra bình luận độc hại
        const isToxic = await isCommentInappropriate(comment);
        if (isToxic) {
            return res.status(400).json({ message: "Bình luận này có nội dung độc hại." });
        }

        // Tạo và lưu bình luận
        const newComment = new Comment({
            comment,
            account: userAccount._id,
            product: productRecord._id
        });

        await newComment.save();

        // Tăng commentCount trong Product (an toàn hơn với $inc)
        await Product.findByIdAndUpdate(productId, { $inc: { commentCount: 1 } });

        return res.status(201).json({ message: "Bình luận đã được thêm thành công!" });
        
    } catch (error) {
        console.error("❌ Lỗi khi tạo bình luận:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi server.", error: error.message });
    }
};
// 🧠 Kiểm tra toxic comment bằng HuggingFace
const isCommentInappropriate = async (comment) => {
    if (!comment || comment.trim().length === 0) return false;

    try {
        const response = await axios.post(
            HUGGINGFACE_API_URL,
            { inputs: comment },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("📦 HuggingFace Response:", JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data) && response.data[0]?.[0]?.score !== undefined) {
            const toxicityScore = response.data[0][0].score;
            console.log("🧪 Toxicity Score:", toxicityScore);
            return toxicityScore > 0.35;
        } else {
            console.warn("⚠️ Phản hồi không hợp lệ từ HuggingFace:", response.data);
            return true;
        }
    } catch (error) {
        console.error("⚠️ Lỗi từ HuggingFace API:", error.message);
        return true;
    }
};

//  Thông điệp nếu comment không phù hợp
const getReplacementComment = () => {
    return "Bạn hãy giữ bình tĩnh và comment văn minh hơn!";
};

// 📄 Lấy tất cả bình luận theo sản phẩm
const getCommentsByProductId = async (req, res) => { 
    try {
        const productId = req.params.productId; 
        const comments = await Comment.find({ product: productId }) 
            .populate('account', 'fullName');
        return res.status(200).json(comments);
    } catch (error) {
        console.error("❌ Lỗi khi lấy bình luận:", error);
        return res.status(500).json({ message: "Lỗi khi lấy bình luận." });
    }
};

//  Xoá bình luận
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const { accountId } = req.body; // Lấy accountId từ request body hoặc req.user nếu có middleware auth

        // Tìm bình luận
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại." });
        }

        // ✅ Kiểm tra quyền: chỉ người đã comment mới được xoá
        if (comment.account.toString() !== accountId) {
            return res.status(403).json({ message: "Bạn không có quyền xoá bình luận này." });
        }

        // Xoá bình luận
        await Comment.findByIdAndDelete(commentId);

        // Giảm số lượng bình luận
        await Product.findByIdAndUpdate(comment.product, { $inc: { commentCount: -1 } });

        return res.status(200).json({ message: "Đã xoá bình luận thành công." });

    } catch (error) {
        console.error("❌ Lỗi khi xoá bình luận:", error);
        return res.status(500).json({ message: "Lỗi khi xoá bình luận." });
    }
};


//  Đếm số bình luận theo sản phẩm
const getCommentCountByProductId = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId).select('commentCount');
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
        }

        return res.status(200).json({ count: product.commentCount });
    } catch (error) {
        console.error("❌ Lỗi khi lấy số lượng bình luận:", error);
        return res.status(500).json({ message: "Lỗi khi lấy số lượng bình luận." });
    }
};
const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const { accountId, newContent } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại." });
        }

        if (comment.account.toString() !== accountId) {
            return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này." });
        }

        // Optional: check toxic content again
        const isToxic = await isCommentInappropriate(newContent);
        if (isToxic) {
            return res.status(400).json({ message: "Nội dung mới chứa nội dung độc hại." });
        }

        comment.comment = newContent;
        await comment.save();

        return res.status(200).json({ message: "Bình luận đã được cập nhật thành công." });

    } catch (error) {
        console.error("❌ Lỗi khi cập nhật bình luận:", error);
        return res.status(500).json({ message: "Lỗi khi cập nhật bình luận." });
    }
};


module.exports = {
    createComment,
    getCommentsByProductId,  
    deleteComment,
    getCommentCountByProductId,
    updateComment
};
