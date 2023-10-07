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
      return peerConnection.localDescription;
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      const peerConnection = this.peer;
      await peerConnection.setRemoteDescription(offer);
      await peerConnection.setLocalDescription();
      return peerConnection.localDescription;
    }
  }

  async addIceCandidates(candidate: RTCIceCandidate) {
    if (this.peer) {
      this.peer.addIceCandidate(candidate);
    }
  }

  async setRemoteDescription(answer: RTCSessionDescriptionInit) {
    if (this.peer) {
      this.peer.setRemoteDescription(answer);
    }
  }
}

export default new PeerService();
