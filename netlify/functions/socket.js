const express = require("express");
const { createServer } = require("http");
const { startSocketServer } = require("../../server/realtime/socket");

let started = false;
let server;

exports.handler = async () => {
  if (!started) {
    const app = express();
    server = createServer(app);
    startSocketServer(server);
    const port = process.env.SOCKET_PORT || 5001;
    server.listen(port, () => {
      console.log(`Socket server listening on ${port}`);
    });
    started = true;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "socket-ready" }),
  };
};

