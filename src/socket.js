// const jwt = require('jsonwebtoken');
// const Account = require('./models/Account');

// let queue = [];
// let activeSessions = {}; // { userId: adminSocketId }
// let socketToUser = {};   // { userSocketId: userId }
// let onlineAdmins = new Set(); // admin socket IDs

// function setupSocket(io) {
//   io.use(async (socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error('No token provided'));

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const account = await Account.findById(decoded.id).populate('roles');
//       if (!account) return next(new Error('Account not found'));

//       socket.user = {
//         id: account._id.toString(),
//         roles: account.roles.map(r => r.name),
//         fullName: account.fullName
//       };
//       next();
//     } catch (err) {
//       next(new Error('Authentication error'));
//     }
//   });

//   io.on('connection', (socket) => {
//     const { id, roles } = socket.user;
//     const isAdmin = roles.includes('Admin');

//     if (isAdmin) {
//       console.log(`✅ Admin connected: ${id}`);
//       onlineAdmins.add(socket.id);
//       assignNextUser(io, socket.id);
//     } else {
//       console.log(`👤 User connected: ${id}`);
//       queue.push({ userId: id, socketId: socket.id });
//       socketToUser[socket.id] = id;
//       tryAssignToAdmin(io);
//     }

//     // Nhận tin nhắn và chuyển tiếp
//     socket.on('send_message', ({ to, message }) => {
//       io.to(to).emit('receive_message', {
//         from: socket.user.fullName,
//         message
//       });
//     });

//     // Admin kết thúc phiên chat với user hiện tại
//     socket.on('end_chat', ({ userSocketId }) => {
//       const userId = socketToUser[userSocketId];
//       if (!userId) return;

//       // Gửi thông báo tới user
//       io.to(userSocketId).emit('chat_ended', { message: 'Admin đã kết thúc cuộc trò chuyện.' });

//       // Xóa session
//       delete activeSessions[userId];

//       // Gán user lại vào hàng chờ
//       queue.push({ userId, socketId: userSocketId });

//       // Admin gán user tiếp theo
//       assignNextUser(io, socket.id);
//     });

//     socket.on('disconnect', () => {
//       if (isAdmin) {
//         console.log(`🔌 Admin disconnected: ${socket.id}`);
//         onlineAdmins.delete(socket.id);

//         // Tìm tất cả user đang chat với admin này
//         for (const [userId, adminSocketId] of Object.entries(activeSessions)) {
//           if (adminSocketId === socket.id) {
//             const userSocketId = findSocketIdByUserId(io, userId);
//             if (userSocketId) {
//               queue.push({ userId, socketId: userSocketId });
//             }
//             delete activeSessions[userId];
//           }
//         }

//       } else {
//         console.log(`🔌 User disconnected: ${socket.id}`);
//         queue = queue.filter(u => u.userId !== id);
//         delete activeSessions[id];
//         delete socketToUser[socket.id];
//       }
//     });
//   });
// }

// function assignNextUser(io, adminSocketId) {
//   if (queue.length === 0) return;

//   const nextUser = queue.shift();
//   activeSessions[nextUser.userId] = adminSocketId;
//   socketToUser[nextUser.socketId] = nextUser.userId;

//   io.to(adminSocketId).emit('start_chat', {
//     userId: nextUser.userId,
//     socketId: nextUser.socketId
//   });

//   io.to(nextUser.socketId).emit('start_chat', {
//     adminSocketId
//   });
// }

// function tryAssignToAdmin(io) {
//   for (const adminSocketId of onlineAdmins) {
//     const isBusy = Object.values(activeSessions).includes(adminSocketId);
//     if (!isBusy) {
//       assignNextUser(io, adminSocketId);
//       break;
//     }
//   }
// }

// function findSocketIdByUserId(io, userId) {
//   const sockets = Array.from(io.of("/").sockets.values());
//   for (const socket of sockets) {
//     if (socket.user?.id === userId) return socket.id;
//   }
//   return null;
// }

// module.exports = setupSocket;
const jwt = require('jsonwebtoken');
const Account = require('./models/Account');

let queue = [];
let userToAdmin = {};             // { userId: adminSocketId }
let adminToUsers = {};            // { adminSocketId: Set<userId> }
let socketToUser = {};            // { userSocketId: userId }
let onlineAdmins = new Set();
let pendingMessages = {};         // NEW: { userId: [{ message, from }] }

function setupSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const account = await Account.findById(decoded.id).populate('roles');
      if (!account) return next(new Error('Account not found'));

      socket.user = {
        id: account._id.toString(),
        roles: account.roles.map(r => r.name),
        fullName: account.fullName
      };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { id, roles } = socket.user;
    const isAdmin = roles.includes('Admin');

    if (isAdmin) {
      console.log(`✅ Admin connected: ${id}`);
      onlineAdmins.add(socket.id);
      adminToUsers[socket.id] = new Set();
      assignNextUser(io, socket.id);
    } else {
      console.log(`👤 User connected: ${id}`);
      queue.push({ userId: id, socketId: socket.id });
      socketToUser[socket.id] = id;
      tryAssignToAdmin(io);
    }

    // Handle send_message
    socket.on('send_message', ({ userId, message }) => {
      if (isAdmin) {
        const userSocketId = findSocketIdByUserId(io, userId);
        if (userSocketId) {
          io.to(userSocketId).emit('receive_message', {
            from: socket.user.fullName,
            message
          });
        }
      } else {
        const adminSocketId = userToAdmin[id];
        const msgPayload = {
          from: socket.user.fullName,
          userId: id,
          message
        };

        if (adminSocketId) {
          io.to(adminSocketId).emit('receive_message', msgPayload);
        } else {
          // Admin chưa được gán => lưu tin nhắn tạm
          if (!pendingMessages[id]) pendingMessages[id] = [];
          pendingMessages[id].push(msgPayload);
        }
      }
    });

    // Admin ends chat
    socket.on('end_chat', ({ userId }) => {
      // if (!userToAdmin[userId] || userToAdmin[userId] !== socket.id) return;

      const userSocketId = findSocketIdByUserId(io, userId);
      if (userSocketId) {
        io.to(userSocketId).emit('chat_ended', { message: 'Admin đã kết thúc cuộc trò chuyện.' });
      }

      // delete userToAdmin[userId];
      // adminToUsers[socket.id].delete(userId);

      // // Đưa user về lại queue
      // queue.push({ userId, socketId: userSocketId });

      // // Gán user mới cho admin
      // assignNextUser(io, socket.id);
    });

    socket.on('disconnect', () => {
      if (isAdmin) {
        console.log(`🔌 Admin disconnected: ${socket.id}`);
        onlineAdmins.delete(socket.id);

        const users = adminToUsers[socket.id] || new Set();
        for (const userId of users) {
          const userSocketId = findSocketIdByUserId(io, userId);
          if (userSocketId) {
            queue.push({ userId, socketId: userSocketId });
            delete userToAdmin[userId];
          }
        }

        delete adminToUsers[socket.id];
        tryAssignToAdmin(io);
      } else {
        console.log(`🔌 User disconnected: ${socket.id}`);
        queue = queue.filter(u => u.userId !== id);
        delete socketToUser[socket.id];

        const adminSocketId = userToAdmin[id];
        if (adminSocketId) {
          adminToUsers[adminSocketId].delete(id);
          delete userToAdmin[id];
          assignNextUser(io, adminSocketId);
        }
      }
    });
  });
}

function assignNextUser(io, adminSocketId) {
  if (queue.length === 0) return;
  if (adminToUsers[adminSocketId].size >= 5) return;

  const nextUser = queue.shift();
  if (!nextUser) return;

  userToAdmin[nextUser.userId] = adminSocketId;
  adminToUsers[adminSocketId].add(nextUser.userId);
  socketToUser[nextUser.socketId] = nextUser.userId;

  io.to(adminSocketId).emit('start_chat', {
    userId: nextUser.userId,
    socketId: nextUser.socketId
  });

  io.to(nextUser.socketId).emit('start_chat', {
    adminSocketId
  });

  // 🔁 Gửi lại tin nhắn chờ (nếu có)
  if (pendingMessages[nextUser.userId]) {
    for (const msg of pendingMessages[nextUser.userId]) {
      io.to(adminSocketId).emit('receive_message', msg);
    }
    delete pendingMessages[nextUser.userId];
  }
}

function tryAssignToAdmin(io) {
  for (const adminSocketId of onlineAdmins) {
    assignNextUser(io, adminSocketId);
  }
}

function findSocketIdByUserId(io, userId) {
  const sockets = Array.from(io.of("/").sockets.values());
  for (const socket of sockets) {
    if (socket.user?.id === userId) return socket.id;
  }
  return null;
}

module.exports = setupSocket;
