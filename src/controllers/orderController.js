const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// 🟢 Tạo đơn hàng mới từ giỏ hàng
// const createOrder = async (req, res) => {
//   const { account_id, phone, name, email, payment_method, note } = req.body;

//   try {
//     // Lấy sản phẩm trong giỏ hàng
//     const cartItems = await CartItem.find({ account_id }).populate('product_id');

//     if (!cartItems.length) {
//       return res.status(400).json({ message: 'Giỏ hàng trống!' });
//     }

//     // Tính tổng tiền
//     const total = cartItems.reduce((sum, item) => {
//       return sum + item.quantity * item.product_id.price;
//     }, 0);

//     // Tạo đơn hàng
//     const order = new Order({
//       account_id,
//       phone,
//       name,
//       email,
//       payment_method,
//       note,
//       total,
//     });

//     await order.save();

//     // Tạo chi tiết đơn hàng cho mỗi sản phẩm trong giỏ
//     for (const item of cartItems) {
//       const orderDetail = new OrderDetail({
//         order_id: order._id,
//         product_id: item.product_id._id,
//         quantity: item.quantity,
//         price: item.product_id.price,
//       });

//       await orderDetail.save();
//     }

//     // Xóa giỏ hàng sau khi tạo đơn hàng
//     await CartItem.deleteMany({ account_id });

//     return res.status(201).json({ message: 'Đặt hàng thành công!', order });
//   } catch (error) {
//     console.error('❌ Lỗi khi tạo đơn hàng:', error);
//     return res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: error.message });
//   }
// };
// 🟢 Tạo đơn hàng mới từ giỏ hàng
const createOrder = async (req, res) => {
  const { account_id, phone, name, email, payment_method, note } = req.body;

  try {
    // Lấy sản phẩm trong giỏ hàng
    const cartItems = await CartItem.find({ account_id }).populate('product_id');

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Giỏ hàng trống!' });
    }

    // Tính tổng tiền
    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product_id.price;
    }, 0);

    // Tạo đơn hàng
    const order = new Order({
      account_id,
      phone,
      name,
      email,
      payment_method,
      note,
      total,
    });

    await order.save();

    // Tạo chi tiết đơn hàng cho mỗi sản phẩm trong giỏ + cập nhật tồn kho
    for (const item of cartItems) {
      const orderDetail = new OrderDetail({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        price: item.product_id.price,
      });

      await orderDetail.save();

      // ➖ Trừ số lượng sản phẩm trong kho
      const product = await Product.findById(item.product_id._id);
      if (product) {
        product.quantity -= item.quantity;

        // Đảm bảo không giảm về số âm
        if (product.quantity < 0) {
          return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho.` });
        }

        await product.save();
      }
    }

    // Xóa giỏ hàng sau khi tạo đơn hàng
    await CartItem.deleteMany({ account_id });

    return res.status(201).json({ message: 'Đặt hàng thành công!', order });
  } catch (error) {
    console.error('❌ Lỗi khi tạo đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: error.message });
  }
};

// 🧠 Lấy đơn hàng theo account
const getOrdersByAccount = async (req, res) => {
  const { account_id } = req.params;

  try {
    const orders = await Order.find({ account_id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.' });
  }
};

// 🔄 Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công.', order });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng.' });
  }
};

// ❌ Xoá đơn hàng
const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
    }

    return res.status(200).json({ message: 'Đơn hàng đã được xoá.' });
  } catch (error) {
    console.error('❌ Lỗi khi xoá đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi khi xoá đơn hàng.' });
  }
};

// ➕ Thêm chi tiết đơn hàng
const addOrderDetail = async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;

  try {
    const order = await Order.findById(order_id);
    const product = await Product.findById(product_id);

    if (!order || !product) {
      return res.status(404).json({ message: 'Đơn hàng hoặc sản phẩm không tồn tại.' });
    }

    const newDetail = new OrderDetail({ order_id, product_id, quantity, price });
    await newDetail.save();

    return res.status(201).json({ message: 'Thêm chi tiết đơn hàng thành công.', orderDetail: newDetail });
  } catch (error) {
    console.error('❌ Lỗi khi thêm chi tiết đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// 📦 Lấy chi tiết đơn hàng theo order_id
const getOrderDetailsByOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const details = await OrderDetail.find({ order_id }).populate('product_id');
    return res.status(200).json(details);
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// 🗑️ Xoá chi tiết đơn hàng theo id
const deleteOrderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const detail = await OrderDetail.findByIdAndDelete(id);
    if (!detail) {
      return res.status(404).json({ message: 'Chi tiết đơn hàng không tồn tại.' });
    }
    return res.status(200).json({ message: 'Đã xóa chi tiết đơn hàng.' });
  } catch (error) {
    console.error('❌ Lỗi khi xóa chi tiết đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};
// 📋 Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Lỗi khi lấy tất cả đơn hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng.' });
  }
};

module.exports = {
    createOrder,
    getOrdersByAccount,
    updateOrderStatus,
    deleteOrder,
    addOrderDetail,
    getOrderDetailsByOrder,
    deleteOrderDetail,
    getAllOrders
  };
  
