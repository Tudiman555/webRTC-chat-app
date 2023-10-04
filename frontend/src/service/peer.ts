class PeerService {
  peer: RTCPeerConnection | undefined = undefined;

  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302"],
          },
        ],
      });
    }
  }

  async getOffer() {
    if (this.peer) {
      const peerConnection = this.peer;
      await peerConnection.setLocalDescription();

      // Check if ICE gathering is already complete
      if (peerConnection.iceGatheringState === "complete") {
        return peerConnection.localDescription;
      }

      // Create a Promise that resolves when ICE gathering is complete
      const iceGatheringCompletePromise = new Promise((resolve) => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve(null);
        } else {
          peerConnection.addEventListener("icegatheringstatechange", () => {
            if (peerConnection.iceGatheringState === "complete") {
              resolve(null);
            }
          });
        }
      });

      // Wait for ICE gathering to complete
      await iceGatheringCompletePromise;

      return peerConnection.localDescription;
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      const peerConnection = this.peer;
      await peerConnection.setRemoteDescription(offer);
      await peerConnection.setLocalDescription();

      if (peerConnection.iceGatheringState === "complete") {
        return peerConnection.localDescription;
      }

      const iceGatheringCompletePromise = new Promise((resolve) => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve(null);
        } else {
          peerConnection.addEventListener("icegatheringstatechange", () => {
            if (peerConnection.iceGatheringState === "complete") {
              resolve(null);
            }
          });
        }
      });

      // Wait for ICE gathering to complete
      await iceGatheringCompletePromise;

      return peerConnection.localDescription;
    }
  }

  async setRemoteDescription(answer: RTCSessionDescriptionInit) {
    if (this.peer) {
      this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }
}

export default new PeerService();
