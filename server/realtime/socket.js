const { Server } = require("socket.io");
const { registerSocketServer } = require("./bus");

const startSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("kitchen:subscribe", (station) => {
      socket.join(`station:${station}`);
    });

    socket.on("orders:subscribe", (userId) => {
      if (userId) {
        socket.join(`orders:${userId}`);
      }
    });
  });

  registerSocketServer(io);
  return io;
};

module.exports = {
  startSocketServer,
};

