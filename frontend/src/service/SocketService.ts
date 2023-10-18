import io, { Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../types/socket";

class SocketService {
  private static instance: SocketService;
  socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  private constructor() {
    this.connect("http://localhost:4000");
  }

  private connect(serverUrl: string) {
    if (!this.socket) {
      this.socket = io(serverUrl);

      this.socket.on("connect", () => {
        console.log("Socket.IO connected");
      });

      this.socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
      });
    }
  }

  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
}

export default SocketService.getInstance()
