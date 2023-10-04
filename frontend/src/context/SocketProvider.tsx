import React, { createContext, useContext, useMemo } from "react";
import { Socket, io } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../../types/socket";

interface SocketContextProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export const SocketContext = createContext<SocketContextProps>(
  {} as SocketContextProps
);

interface Props {
  children: React.JSX.Element;
}

export const useSocket = () => useContext(SocketContext);

const ContextProvider: React.FC<Props> = (props) => {
  const socket = useMemo(() => io("http://localhost:4000"), []);
  return (
    <SocketContext.Provider value={{ socket }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default ContextProvider;
