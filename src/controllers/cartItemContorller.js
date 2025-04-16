const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Account = require('../models/Account');

// 🟢 Thêm một sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  const { quantity, product_id, account_id } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(product_id) || !mongoose.Types.ObjectId.isValid(account_id)) {
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    const account = await Account.findById(account_id);
    if (!account) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    }

    let existingCartItem = await CartItem.findOne({ product_id, account_id });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json({ message: 'Cập nhật giỏ hàng thành công!', cartItem: existingCartItem });
    }

    const newCartItem = new CartItem({ quantity, product_id, account_id });
    await newCartItem.save();
    return res.status(201).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng.', cartItem: newCartItem });
  } catch (error) {
    console.error('❌ Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi server.', error: error.message });
  }
};

// 🧠 Lấy tất cả sản phẩm trong giỏ hàng của người dùng
const getCartItems = async (req, res) => {
  const { account_id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(account_id)) {
      return res.status(400).json({ message: 'ID tài khoản không hợp lệ.' });
    }

    const cartItems = await CartItem.find({ account_id }).populate('product_id');
    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng.' });
  }
};

// 🔄 Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Sản phẩm trong giỏ hàng không tồn tại.' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    return res.status(200).json({ message: 'Số lượng sản phẩm trong giỏ hàng đã được cập nhật.', cartItem });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng.' });
  }
};

// ❌ Xóa một sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    const cartItem = await CartItem.findByIdAndDelete(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
    }

    return res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' });
  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.' });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
};
