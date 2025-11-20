let ioInstance = null;

const registerSocketServer = (io) => {
  ioInstance = io;
};

const emitKitchenUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit("kitchen:update", payload);
  }
};

const emitOrderUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit("order:update", payload);
  }
};

module.exports = {
  registerSocketServer,
  emitKitchenUpdate,
  emitOrderUpdate,
};

