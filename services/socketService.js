const socketIO = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server);

    io.on("connection", (socket) => {
      socket.on("user_connected", async (userId) => {
        socket.userId = userId;
        socket.join(`user_${userId}`);
        io.emit("user_status_change", { userId, isOnline: true });
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          io.emit("user_status_change", {
            userId: socket.userId,
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      });

      // Add friend request event handlers
      socket.on("friend_request_sent", async ({ toUserId, fromUser }) => {
        // Broadcast to all instances of the target user
        io.emit("new_friend_request", {
          toUserId,
          fromUser,
          count: 1,
        });
      });

      socket.on("friend_request_accepted", ({ userId, count }) => {
        // Broadcast friend request count update
        io.emit("update_request_count", { userId, count });
      });

      socket.on("join_user_room", (userId) => {
        socket.join(`user_${userId}`);
        // Notify all clients about user's online status
        io.emit("user_status_change", {
          userId,
          isOnline: true,
          lastSeen: new Date(),
        });
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};
