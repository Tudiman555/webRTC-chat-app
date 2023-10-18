import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketEvents,
} from "../../types/socket";
import { generateRoomId } from "./utils";

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

const activeRoomsById = new Map<string, string>();

io.on(SocketEvents.CONNECTION, (socket) => {
  socket.on(SocketEvents.CREATE_ROOM, () => {
    const roomId = generateRoomId();
    activeRoomsById.set(socket.id, roomId);
    socket.emit(SocketEvents.CREATE_ROOM, { roomId });
  });

  socket.on("disconnect", () => {
    activeRoomsById.delete(socket.id);
  });

  socket.on(SocketEvents.JOIN_ROOM, ({ roomId }) => {
    const activeRooms = Array.from(activeRoomsById.values());
    if (!activeRooms.includes(roomId)) {
      socket.emit(SocketEvents.ERR0R, {
        error: "Sorry Room does not Exist !!",
      });
      return;
    }
    socket.join(roomId);
    socket.emit(SocketEvents.JOIN_ROOM, {
      isHost: !!activeRoomsById.get(socket.id),
    });
    socket.broadcast
      .to(roomId)
      .emit(SocketEvents.USER_JOINED, { id: socket.id });
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
