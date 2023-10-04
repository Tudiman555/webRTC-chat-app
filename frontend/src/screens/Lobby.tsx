import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { SocketEvents } from "../../../types/socket";
interface LobbyProps {}
const Lobby: React.FC<LobbyProps> = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const { socket } = useSocket();
  const handleSubmitForm = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      socket.emit(SocketEvents.JOIN_ROOM, { email, room });
    },
    [email, room]
  );
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (data: { email: string; room: string }) => {
      navigate(`room/${data.room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on(SocketEvents.JOIN_ROOM, handleJoinRoom);

    // [Clean up] we dont want to end up listing to the same event twice
    return () => {
      socket.off(SocketEvents.JOIN_ROOM, handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="room">Room</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default Lobby;
