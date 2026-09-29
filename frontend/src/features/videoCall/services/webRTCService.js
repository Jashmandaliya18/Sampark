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

        // Screen share & audio mixing state
        this.screenStream = null;
        this.audioContext = null;
        this.audioDestination = null;
        this.micGainNode = null;
        this.screenAudioSource = null;
        this.micAudioSource = null;
        this.onScreenShareEndedCallback = null;
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

    getVideoSender() {
        if (!this.peerConnection) return null;
        const senders = this.peerConnection.getSenders();
        return (
            senders.find((s) => s.track && s.track.kind === 'video') ||
            senders.find((s) => {
                const trans = this.peerConnection.getTransceivers?.().find((t) => t.sender === s);
                return trans?.receiver?.track?.kind === 'video';
            }) ||
            senders.find((s) => s.track === null)
        );
    }

    getAudioSender() {
        if (!this.peerConnection) return null;
        const senders = this.peerConnection.getSenders();
        return (
            senders.find((s) => s.track && s.track.kind === 'audio') ||
            senders.find((s) => {
                const trans = this.peerConnection.getTransceivers?.().find((t) => t.sender === s);
                return trans?.receiver?.track?.kind === 'audio';
            }) ||
            senders.find((s) => s.track === null)
        );
    }

    async startScreenShare({ onEnded } = {}) {
        if (!navigator?.mediaDevices?.getDisplayMedia) {
            throw new Error('Screen sharing is not supported by your browser or device.');
        }

        // Stop any previously running screen sharing instance cleanly
        if (this.screenStream) {
            await this.stopScreenShare();
        }

        let displayStream = null;
        try {
            // Request both video and audio. Modern browsers allow tab/screen audio capture.
            displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                },
                audio: true,
            });
        } catch (err) {
            // Fallback for browsers that fail complex constraint objects
            if (err.name === 'TypeError' || err.name === 'ConstraintNotSatisfiedError') {
                displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });
            } else {
                throw err;
            }
        }

        this.screenStream = displayStream;
        const screenVideoTrack = displayStream.getVideoTracks()[0];
        if (!screenVideoTrack) {
            throw new Error('No video track found in screen-sharing stream.');
        }

        // Set up callback when user stops sharing via browser native UI or tab close
        this.onScreenShareEndedCallback = onEnded;
        screenVideoTrack.onended = () => {
            if (this.onScreenShareEndedCallback) {
                this.onScreenShareEndedCallback();
            }
        };

        // Replace outgoing video track on existing peer connection
        const videoSender = this.getVideoSender();
        if (videoSender) {
            await videoSender.replaceTrack(screenVideoTrack);
        } else {
            console.warn('No video sender found on peer connection to replace track.');
        }

        // Handle Screen Audio (Mix screen audio with local microphone)
        const screenAudioTracks = displayStream.getAudioTracks();
        const hasAudio = screenAudioTracks.length > 0;
        const micTrack = this.localStream?.getAudioTracks()?.[0];

        if (hasAudio && micTrack) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.audioContext = new AudioCtx();
                    if (this.audioContext.state === 'suspended') {
                        await this.audioContext.resume();
                    }

                    this.audioDestination = this.audioContext.createMediaStreamDestination();

                    // Screen audio source node
                    const screenAudioTrack = screenAudioTracks[0];
                    this.screenAudioSource = this.audioContext.createMediaStreamSource(
                        new MediaStream([screenAudioTrack])
                    );
                    this.screenAudioSource.connect(this.audioDestination);

                    // Microphone source node with gain control for muting
                    this.micAudioSource = this.audioContext.createMediaStreamSource(
                        new MediaStream([micTrack])
                    );
                    this.micGainNode = this.audioContext.createGain();
                    this.micGainNode.gain.value = micTrack.enabled ? 1 : 0;
                    this.micAudioSource.connect(this.micGainNode);
                    this.micGainNode.connect(this.audioDestination);

                    // Replace outgoing WebRTC audio sender with mixed audio track
                    const mixedAudioTrack = this.audioDestination.stream.getAudioTracks()[0];
                    const audioSender = this.getAudioSender();
                    if (audioSender && mixedAudioTrack) {
                        await audioSender.replaceTrack(mixedAudioTrack);
                    }
                }
            } catch (audioErr) {
                console.warn('Could not mix screen audio with microphone, continuing with mic only:', audioErr);
            }
        }

        return {
            screenStream: this.screenStream,
            hasAudio,
        };
    }

    async stopScreenShare() {
        // 1. Restore camera video track on peer connection
        const videoSender = this.getVideoSender();
        const cameraTrack = this.localStream?.getVideoTracks()?.[0];
        if (videoSender && cameraTrack) {
            try {
                await videoSender.replaceTrack(cameraTrack);
            } catch (err) {
                console.error('Error restoring camera track to peer connection:', err);
            }
        }

        // 2. Restore original microphone track on peer connection
        const audioSender = this.getAudioSender();
        const micTrack = this.localStream?.getAudioTracks()?.[0];
        if (audioSender && micTrack) {
            try {
                await audioSender.replaceTrack(micTrack);
            } catch (err) {
                console.error('Error restoring microphone track to peer connection:', err);
            }
        }

        // 3. Clean up Web Audio mixing context and nodes
        if (this.audioContext) {
            try {
                if (this.audioContext.state !== 'closed') {
                    await this.audioContext.close();
                }
            } catch (e) {
                console.error('Error closing audioContext:', e);
            }
            this.audioContext = null;
            this.audioDestination = null;
            this.screenAudioSource = null;
            this.micAudioSource = null;
            this.micGainNode = null;
        }

        // 4. Clean up screen stream tracks and listener
        if (this.screenStream) {
            this.screenStream.getTracks().forEach((track) => {
                try {
                    track.onended = null;
                    track.stop();
                } catch (e) {
                    console.error('Error stopping screen track:', e);
                }
            });
            this.screenStream = null;
        }

        this.onScreenShareEndedCallback = null;
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }

        // If screen sharing audio mixer is active, adjust mic gain node
        if (this.micGainNode && this.audioContext) {
            try {
                this.micGainNode.gain.setValueAtTime(enabled ? 1 : 0, this.audioContext.currentTime);
            } catch (e) {
                console.error('Error updating mic gain during screen share:', e);
            }
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
        // Stop screen sharing tracks and audio mixer
        if (this.screenStream) {
            this.screenStream.getTracks().forEach((track) => {
                try {
                    track.onended = null;
                    track.stop();
                } catch (e) {
                    console.error('Error stopping screen track in cleanup:', e);
                }
            });
            this.screenStream = null;
        }

        if (this.audioContext) {
            try {
                if (this.audioContext.state !== 'closed') {
                    this.audioContext.close().catch(() => {});
                }
            } catch (e) {}
            this.audioContext = null;
            this.audioDestination = null;
            this.screenAudioSource = null;
            this.micAudioSource = null;
            this.micGainNode = null;
        }
        this.onScreenShareEndedCallback = null;

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
