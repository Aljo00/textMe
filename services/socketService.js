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
