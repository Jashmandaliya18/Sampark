import { RTC_CONFIGURATION } from '../utils/videoCallConstants.js';

class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.iceCandidatesQueue = [];
        this.isRemoteDescriptionSet = false;

        this.onIceCandidateCallback = null;
        this.onRemoteStreamCallback = null;
        this.onConnectionStateCallback = null;
    }

    async getLocalStream(constraints = { audio: true, video: true }) {
        if (this.localStream) {
            return this.localStream;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error('WebRTC audio/video is not supported in this browser environment.');
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing local media devices:', error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('Camera/Microphone permission was denied. Please allow access in browser settings.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                throw new Error('No camera or microphone found on your device.');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                throw new Error('Camera or microphone is already in use by another application.');
            } else {
                throw new Error('Failed to access media devices: ' + (error.message || 'Unknown error'));
            }
        }
    }

    createPeerConnection({ onIceCandidate, onRemoteStream, onConnectionState }) {
        if (this.peerConnection) {
            this.cleanupPeerConnection();
        }

        this.onIceCandidateCallback = onIceCandidate;
        this.onRemoteStreamCallback = onRemoteStream;
        this.onConnectionStateCallback = onConnectionState;

        this.peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
        this.isRemoteDescriptionSet = false;
        this.iceCandidatesQueue = [];

        // Attach local tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle ICE Candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidateCallback) {
                this.onIceCandidateCallback(event.candidate);
            }
        };

        // Handle Remote Stream Track Arrival
        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
            } else {
                if (!this.remoteStream) {
                    this.remoteStream = new MediaStream();
                }
                this.remoteStream.addTrack(event.track);
            }

            if (this.onRemoteStreamCallback) {
                this.onRemoteStreamCallback(this.remoteStream);
            }
        };

        // Handle Connection State Changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection ? this.peerConnection.connectionState : 'closed';
            if (this.onConnectionStateCallback) {
                this.onConnectionStateCallback(state);
            }
        };

        return this.peerConnection;
    }

    async createOffer() {
        if (!this.peerConnection) {
            throw new Error('RTCPeerConnection has not been initialized.');
        }

        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });

        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    async handleOffer(offer) {
        if (!this.peerConnection) {
            throw new Error('RTCPeerConnection has not been initialized.');
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        this.isRemoteDescriptionSet = true;
        await this.processIceCandidatesQueue();

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return answer;
    }

    async handleAnswer(answer) {
        if (!this.peerConnection) {
            throw new Error('RTCPeerConnection has not been initialized.');
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.isRemoteDescriptionSet = true;
        await this.processIceCandidatesQueue();
    }

    async addIceCandidate(candidate) {
        if (!candidate) return;

        if (this.peerConnection && this.isRemoteDescriptionSet && this.peerConnection.remoteDescription) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error adding received ICE candidate:', err);
            }
        } else {
            this.iceCandidatesQueue.push(candidate);
        }
    }

    async processIceCandidatesQueue() {
        if (!this.peerConnection || !this.isRemoteDescriptionSet) return;

        while (this.iceCandidatesQueue.length > 0) {
            const candidate = this.iceCandidatesQueue.shift();
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error adding queued ICE candidate:', err);
            }
        }
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    toggleVideo(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    cleanupPeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.onicecandidate = null;
            this.peerConnection.ontrack = null;
            this.peerConnection.onconnectionstatechange = null;

            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        this.iceCandidatesQueue = [];
        this.isRemoteDescriptionSet = false;
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                try {
                    track.stop();
                } catch (e) {
                    console.error('Error stopping track:', e);
                }
            });
            this.localStream = null;
        }

        this.cleanupPeerConnection();

        this.onIceCandidateCallback = null;
        this.onRemoteStreamCallback = null;
        this.onConnectionStateCallback = null;
    }
}

// Export singleton instance
export const webRTCService = new WebRTCService();
