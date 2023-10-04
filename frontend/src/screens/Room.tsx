import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peerService from "../service/peer";
import { SocketEvents } from "../../../types/socket";

const Room: React.FC = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const myVideo = useRef<HTMLVideoElement>();
  const remoteVideo = useRef<HTMLVideoElement>();

  const handleUserJoined = useCallback(
    (data: { email: string; id: string }) => {
      setRemoteSocketId(data.id);
    },
    []
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if (myVideo.current) {
      myVideo.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      if (track.kind === "video") {
        peerService.peer?.addTrack(track, stream);
        console.log("Video Track Added Caller");
      }
    });
    const offer = await peerService.getOffer();
    socket.emit(SocketEvents.CALL_USER, {
      id: remoteSocketId!,
      offer: offer!,
    });
  }, [remoteSocketId, socket]);

  const handleCallIncoming = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => {
        if (track.kind === "video") {
          peerService.peer?.addTrack(track, stream);
          console.log("Video Track Added Answerer");
        }
      });
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      setRemoteSocketId(data.from);
      await peerService.getAnswer(data.offer);
      socket.emit(SocketEvents.CALL_ACCEPTED, {
        to: data.from,
        answer: peerService.peer?.localDescription!,
      });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      await peerService.setRemoteDescription(data.answer);
      console.log("Call Accepted");
    },
    []
  );

  const handleAddTrack = useCallback((data: RTCTrackEvent) => {
    if (data.track.kind === "audio") {
      // This is an audio track
      // You can handle audio tracks here
    } else if (data.track.kind === "video") {
      const remoteStream = data.streams[0];
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
        console.log("Remote Video Track Added", remoteStream);
      }
      // This is a video track
      // You can handle video tracks here
    }
  }, []);

  useEffect(() => {
    socket.on(SocketEvents.USER_JOINED, handleUserJoined);
    socket.on(SocketEvents.CALL_INCOMING, handleCallIncoming);
    socket.on(SocketEvents.CALL_ACCEPTED, handleCallAccepted);
    peerService.peer?.addEventListener("track", handleAddTrack);
    peerService.peer?.canTrickleIceCandidates;

    // [Clean up] we dont want to end up listing to the same event twice
    return () => {
      socket.off(SocketEvents.USER_JOINED, handleUserJoined);
      socket.off(SocketEvents.CALL_INCOMING, handleCallIncoming);
      socket.off(SocketEvents.CALL_ACCEPTED, handleCallAccepted);
      peerService.peer?.removeEventListener("track", handleAddTrack);
    };
  }, [
    handleAddTrack,
    handleCallAccepted,
    handleCallIncoming,
    handleUserJoined,
    socket,
  ]);

  console.log(myVideo, "myVideo");
  console.log(remoteVideo, "remoteVideo");

  return (
    <>
      <div>Room</div>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myVideo && (
        <>
          <h1>My Video</h1>
          <video
            style={{ flexDirection: "row", width: "100%", height: "100%" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={myVideo as any}
            autoPlay
            playsInline
          ></video>
        </>
      )}
      {remoteVideo && (
        <>
          <h1>Remote Video</h1>
          <video
            style={{ flexDirection: "row", width: "100%", height: "100%" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={remoteVideo as any}
            autoPlay
            playsInline
          ></video>
        </>
      )}
    </>
  );
};

export default Room;
