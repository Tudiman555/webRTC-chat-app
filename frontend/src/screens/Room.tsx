import React, { useCallback, useEffect, useRef, useState } from "react";
import peerService from "../service/peer";
import { SocketEvents } from "../../../types/socket";
import SocketService from "../service/SocketService";
import { useNavigate, useParams } from "react-router-dom";

const Room: React.FC = () => {
  const { socket } = SocketService;
  const { roomId } = useParams<{ roomId: string }>();
  const [isHost, setIsHost] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const myVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();
  const navigate = useNavigate();

  const handleMyMedia = (type: "video" | "audio") => {
    if (myStream) {
      myStream.getTracks().forEach((stream) => {
        if (stream.kind === type) {
          if (stream.enabled) {
            stream.enabled = false;
          } else {
            stream.enabled = true;
          }
        }
      });
    }
  };

  const handleRemoteMedia = (type: "video" | "audio") => {
    if (remoteStream) {
      remoteStream.getTracks().forEach((stream) => {
        if (stream.kind === type) {
          if (stream.enabled) {
            stream.enabled = false;
          } else {
            stream.enabled = true;
          }
        }
      });
    }
  };

  const getUserStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if (myVideo.current) {
      myVideo.current.srcObject = stream;
    }
    setMyStream(stream);
    return stream;
  };

  const handleCallUser = useCallback(
    async (calle: string) => {
      console.log(`Calling User: ${calle}`);
      const stream = myStream ?? (await getUserStream());

      if (stream) {
        stream.getTracks().forEach((track) => {
          peerService.peer?.addTrack(track, stream);
        });
        const offer = await peerService.getOffer();
        socket.emit(SocketEvents.CALL_USER, {
          id: calle,
          offer: offer!,
        });
        return;
      }
      alert("No Tracks Found");
    },
    [myStream, socket]
  );

  const handleUserJoined = useCallback(
    (data: { id: string }) => {
      const userId = data.id;
      console.log(`User: ${userId} just joined`);
      setRemoteSocketId(data.id);
      handleCallUser(userId);
    },
    [handleCallUser]
  );

  const handleCallIncoming = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      const stream = myStream ?? (await getUserStream());
      if (stream) {
        stream.getTracks().forEach((track) => {
          peerService.peer?.addTrack(track, stream);
        });
        setRemoteSocketId(data.from);
        const answer = await peerService.getAnswer(data.offer);
        console.log("Call Incoming");
        socket.emit(SocketEvents.CALL_ACCEPTED, {
          to: data.from,
          answer: answer!,
        });
        return;
      }
      alert("No Tracks Found");
    },
    [myStream, socket]
  );

  const handleCallAccepted = useCallback(
    async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      await peerService.setRemoteDescription(data.answer);
      console.log("Call Accepted");
    },
    []
  );

  const handleAddTrack = useCallback((data: RTCTrackEvent) => {
    const remoteStream = data.streams[0];
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
    }
    setRemoteStream(remoteStream);
  }, []);

  const handleIcecandidate = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && remoteSocketId) {
        socket.emit(SocketEvents.EXCHANGE_ICECANDIDATE, {
          candidate: event.candidate,
          to: remoteSocketId,
        });
      }
    },
    [remoteSocketId, socket]
  );

  const handleAddIcecandidate = useCallback(
    (data: { from: string; candidate: RTCIceCandidate }) => {
      peerService.addIceCandidates(data.candidate);
    },
    []
  );

  const handleError = useCallback(
    (data: { error: string }) => {
      alert(data.error);
      console.error(data.error);
      navigate("/");
    },
    [navigate]
  );

  const handleJoinRoom = useCallback((data: { isHost: boolean }) => {
    getUserStream()
    setIsHost(data.isHost);
  }, []);

  const joinRoom = () => {
    if (roomId) {
      socket.emit(SocketEvents.JOIN_ROOM, { roomId });
      console.log(`Joining room : ${roomId}`);
      return;
    }
    navigate("/");
  };

  useEffect(() => {
    // Prevents emitting event twice in `Strict Mode`
    // refer `https://react.dev/reference/react/StrictMode` for info

    const timeout = setTimeout(async () => {
      joinRoom();
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (myStream) {
        myStream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    };
  }, [myStream]);

  useEffect(() => {
    socket.on(SocketEvents.JOIN_ROOM, handleJoinRoom);
    socket.on(SocketEvents.USER_JOINED, handleUserJoined);
    socket.on(SocketEvents.CALL_INCOMING, handleCallIncoming);
    socket.on(SocketEvents.CALL_ACCEPTED, handleCallAccepted);
    socket.on(SocketEvents.EXCHANGE_ICECANDIDATE, handleAddIcecandidate);
    socket.on(SocketEvents.ERR0R, handleError);
    peerService.peer?.addEventListener("track", handleAddTrack);
    peerService.peer?.addEventListener("icecandidate", handleIcecandidate);

    // [Clean up] we dont want to end up listing to the same event twice
    return () => {
      socket.off(SocketEvents.USER_JOINED, handleUserJoined);
      socket.off(SocketEvents.CALL_INCOMING, handleCallIncoming);
      socket.off(SocketEvents.CALL_ACCEPTED, handleCallAccepted);
      socket.off(SocketEvents.EXCHANGE_ICECANDIDATE, handleAddIcecandidate);
      socket.off(SocketEvents.ERR0R, handleError);
      peerService.peer?.removeEventListener("track", handleAddTrack);
      peerService.peer?.removeEventListener("icecandidate", handleIcecandidate);
    };
  }, [
    handleAddIcecandidate,
    handleAddTrack,
    handleCallAccepted,
    handleCallIncoming,
    handleError,
    handleIcecandidate,
    handleJoinRoom,
    handleUserJoined,
    socket,
  ]);

  return (
    <>
      <div>Room</div>
      <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <div style={{ width: "50%" }}>
          <h1>My Video</h1>
          <video
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid",
              borderRadius: 8,
              objectFit: "cover",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={myVideo as any}
            muted
            autoPlay
            playsInline
          />
          <button onClick={() => handleMyMedia("audio")}>Mute</button>
          <button onClick={() => handleMyMedia("video")}>
            Turn Off Camera
          </button>
        </div>

        <div style={{ padding: 10 }} />
        <div
          style={{
            width: "50%",
          }}
        >
          <h1>Remote Video</h1>
          <video
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid",
              borderRadius: 8,
              objectFit: "cover",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={remoteVideo as any}
            autoPlay
            playsInline
          />
          {isHost && (
            <>
              <button onClick={() => handleRemoteMedia("audio")}>Mute</button>
              <button onClick={() => handleRemoteMedia("video")}>
                Turn Off Camera
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Room;
