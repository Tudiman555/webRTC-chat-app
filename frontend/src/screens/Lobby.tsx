import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketEvents } from "../../../types/socket";
import SocketService from "../service/SocketService";

interface LobbyProps {}
const Lobby: React.FC<LobbyProps> = () => {
  const { socket } = SocketService;

  const handleSubmitForm = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      socket.emit(SocketEvents.CREATE_ROOM);
    },
    [socket]
  );
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (data: { roomId: string }) => {
      navigate(`room/${data.roomId}`);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on(SocketEvents.CREATE_ROOM, handleJoinRoom);
    // [Clean up] we dont want to end up listing to the same event twice
    return () => {
      socket.off(SocketEvents.CREATE_ROOM, handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <div>
      <h1>Lobby</h1>
      <button onClick={handleSubmitForm}>Create Room</button>
    </div>
  );
};

export default Lobby;
