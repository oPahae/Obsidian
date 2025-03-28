const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let users = {};

io.on("connection", (socket) => {
  const { id, username } = socket.handshake.query;

  if (!id || !username) {
    return;
  }

  users[socket.id] = { id, username };
  io.emit("user-list", Object.values(users));

  socket.broadcast.emit("user-joined", socket.id);

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user-list", Object.values(users));
    io.emit("user-left", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Server statred -> http://localhost:3001");
});
