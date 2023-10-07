import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEvents,
} from "../../types/socket";

const app = express();
const PORT = 4000;

const CORS = cors();

const server = http.createServer(app);
app.use(CORS);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on(SocketEvents.CONNECTION, (socket) => {
  socket.on(SocketEvents.JOIN_ROOM, ({ email, room }) => {
    io.to(room).emit(SocketEvents.USER_JOINED, { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit(SocketEvents.JOIN_ROOM, { email, room });
  });
  socket.on(SocketEvents.CALL_USER, ({ id, offer }) => {
    io.to(id).emit(SocketEvents.CALL_INCOMING, { from: socket.id, offer });
  });

  socket.on(SocketEvents.CALL_ACCEPTED, ({ to, answer }) => {
    io.to(to).emit(SocketEvents.CALL_ACCEPTED, { from: socket.id, answer });
  });
  socket.on(SocketEvents.EXCHANGE_ICECANDIDATE, ({ candidate, to }) => {
    io.to(to).emit(SocketEvents.EXCHANGE_ICECANDIDATE, {
      candidate,
      from: socket.id,
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello Test");
});

server.listen(PORT, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
});
