export enum SocketEvents {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  CREATE_ROOM = "create-room",
  JOIN_ROOM = "join-room",
  USER_JOINED = "user-joined",
  CALL_USER = "call-user",
  CALL_INCOMING = "call-incoming",
  CALL_ACCEPTED = "call-accepted",
  EXCHANGE_ICECANDIDATE = "exchange-icecandidate",
  ERR0R = "error",
}

export interface ClientToServerEvents {
  [SocketEvents.JOIN_ROOM]: (args: { roomId: string }) => void;
  [SocketEvents.CREATE_ROOM]: () => void;
  // [SocketEvents.USER_JOINED]: (args: { email: string; room: string }) => void;
  [SocketEvents.CALL_USER]: (args: {
    id: string;
    offer: RTCSessionDescriptionInit;
  }) => void;
  [SocketEvents.CALL_ACCEPTED]: (args: {
    to: string;
    answer: RTCSessionDescriptionInit;
  }) => void;
  [SocketEvents.EXCHANGE_ICECANDIDATE]: (args: {
    to: string;
    candidate: RTCIceCandidate;
  }) => void;
}

export interface ServerToClientEvents {
  [SocketEvents.JOIN_ROOM]: (
    args: { isHost: boolean }
  ) => void;
  [SocketEvents.ERR0R]: (args: { error: string }) => void;
  [SocketEvents.CREATE_ROOM]: (args: { roomId: string }) => void;
  [SocketEvents.USER_JOINED]: (args: { id: string }) => void;
  [SocketEvents.CALL_USER]: (args: {
    id?: string;
    offer?: RTCSessionDescriptionInit;
  }) => void;
  [SocketEvents.CALL_INCOMING]: (args: {
    from: string;
    offer: RTCSessionDescriptionInit;
  }) => void;
  [SocketEvents.CALL_ACCEPTED]: (args: {
    from: string;
    answer: RTCSessionDescriptionInit;
  }) => void;
  [SocketEvents.EXCHANGE_ICECANDIDATE]: (args: {
    from: string;
    candidate: RTCIceCandidate;
  }) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
