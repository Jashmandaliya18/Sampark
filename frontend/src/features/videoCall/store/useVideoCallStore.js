import { create } from 'zustand';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/useAuthStore.js';
import { VIDEO_CALL_EVENTS, CALL_STATUS } from '../utils/videoCallConstants.js';
import { webRTCService } from '../services/webRTCService.js';

let timerInterval = null;

export const useVideoCallStore = create((set, get) => ({
    callState: CALL_STATUS.IDLE,
    callId: null,
    caller: null,
    receiver: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,
    peerIsMuted: false,
    peerIsVideoOff: false,
    callDuration: 0,
    errorMessage: null,
    isSubscribed: false,

    startTimer: () => {
        if (timerInterval) clearInterval(timerInterval);
        set({ callDuration: 0 });
        timerInterval = setInterval(() => {
            set((state) => ({ callDuration: state.callDuration + 1 }));
        }, 1000);
    },

    stopTimer: () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        set({ callDuration: 0 });
    },

    emitMediaState: (newMuteState, newVideoState) => {
        const { callId, caller, receiver } = get();
        const authUser = useAuthStore.getState().authUser;
        const socket = useAuthStore.getState().socket;
        const peer = authUser?._id === caller?._id ? receiver : caller;

        if (socket && callId && peer) {
            socket.emit(VIDEO_CALL_EVENTS.MEDIA_STATE_TOGGLE, {
                callId,
                targetId: peer._id,
                isMuted: newMuteState !== undefined ? newMuteState : get().isMuted,
                isVideoOff: newVideoState !== undefined ? newVideoState : get().isVideoOff,
            });
        }
    },

    initiateCall: async (targetUser) => {
        const authUser = useAuthStore.getState().authUser;
        const socket = useAuthStore.getState().socket;

        if (!authUser || !socket) {
            toast.error('Unable to initiate call. You are not connected.');
            return;
        }

        if (get().callState !== CALL_STATUS.IDLE) {
            toast.error('You are already in an active call.');
            return;
        }

        const newCallId = `${authUser._id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        set({
            callState: CALL_STATUS.CALLING,
            callId: newCallId,
            caller: authUser,
            receiver: targetUser,
            errorMessage: null,
            isMuted: false,
            isVideoOff: false,
            peerIsMuted: false,
            peerIsVideoOff: false,
        });

        try {
            const stream = await webRTCService.getLocalStream();
            set({ localStream: stream });

            socket.emit(VIDEO_CALL_EVENTS.REQUEST, {
                callId: newCallId,
                receiverId: targetUser._id,
                caller: authUser,
            });
        } catch (error) {
            toast.error(error.message || 'Could not start camera/microphone.');
            get().resetCallState();
        }
    },

    acceptCall: async () => {
        const { callId, caller } = get();
        const socket = useAuthStore.getState().socket;

        if (!callId || !caller || !socket) return;

        set({ callState: CALL_STATUS.CONNECTING });

        try {
            const stream = await webRTCService.getLocalStream();
            set({ localStream: stream });

            webRTCService.createPeerConnection({
                onIceCandidate: (candidate) => {
                    socket.emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
                        callId,
                        candidate,
                        targetId: caller._id,
                    });
                },
                onRemoteStream: (remoteStream) => {
                    set({ remoteStream });
                },
                onConnectionState: (state) => {
                    if (state === 'connected') {
                        set({ callState: CALL_STATUS.CONNECTED });
                        get().startTimer();
                        get().emitMediaState(get().isMuted, get().isVideoOff);
                    } else if (state === 'failed' || state === 'closed') {
                        get().endCall();
                    }
                },
            });

            socket.emit(VIDEO_CALL_EVENTS.ACCEPTED, {
                callId,
                callerId: caller._id,
            });
        } catch (error) {
            toast.error(error.message || 'Could not access media devices.');
            get().rejectCall();
        }
    },

    rejectCall: () => {
        const { callId, caller } = get();
        const socket = useAuthStore.getState().socket;

        if (socket && callId && caller) {
            socket.emit(VIDEO_CALL_EVENTS.REJECTED, {
                callId,
                callerId: caller._id,
            });
        }

        get().resetCallState();
    },

    cancelCall: () => {
        const { callId, receiver } = get();
        const socket = useAuthStore.getState().socket;

        if (socket && callId && receiver) {
            socket.emit(VIDEO_CALL_EVENTS.CANCELLED, {
                callId,
                receiverId: receiver._id,
            });
        }

        get().resetCallState();
    },

    endCall: () => {
        const { callId, caller, receiver } = get();
        const authUser = useAuthStore.getState().authUser;
        const socket = useAuthStore.getState().socket;

        const peer = authUser?._id === caller?._id ? receiver : caller;

        if (socket && callId && peer) {
            socket.emit(VIDEO_CALL_EVENTS.END, {
                callId,
                targetId: peer._id,
            });
        }

        get().resetCallState();
    },

    toggleMic: () => {
        const newMuteState = !get().isMuted;
        webRTCService.toggleAudio(!newMuteState);
        set({ isMuted: newMuteState });
        get().emitMediaState(newMuteState, get().isVideoOff);
    },

    toggleCamera: () => {
        const newVideoState = !get().isVideoOff;
        webRTCService.toggleVideo(!newVideoState);
        set({ isVideoOff: newVideoState });
        get().emitMediaState(get().isMuted, newVideoState);
    },

    resetCallState: () => {
        get().stopTimer();
        webRTCService.cleanup();

        set({
            callState: CALL_STATUS.IDLE,
            callId: null,
            caller: null,
            receiver: null,
            localStream: null,
            remoteStream: null,
            isMuted: false,
            isVideoOff: false,
            peerIsMuted: false,
            peerIsVideoOff: false,
            errorMessage: null,
        });
    },

    subscribeToVideoCallSocket: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket || get().isSubscribed) return;

        set({ isSubscribed: true });

        // Incoming Call Request
        socket.on(VIDEO_CALL_EVENTS.REQUEST, ({ callId, caller }) => {
            const currentCallState = get().callState;
            if (currentCallState !== CALL_STATUS.IDLE) {
                socket.emit(VIDEO_CALL_EVENTS.BUSY, { callId, receiverId: useAuthStore.getState().authUser?._id });
                return;
            }

            const authUser = useAuthStore.getState().authUser;
            set({
                callState: CALL_STATUS.RINGING,
                callId,
                caller,
                receiver: authUser,
                errorMessage: null,
                peerIsMuted: false,
                peerIsVideoOff: false,
            });
        });

        // Call Accepted by Receiver (handled on Caller side)
        socket.on(VIDEO_CALL_EVENTS.ACCEPTED, async ({ callId, receiverId }) => {
            set({ callState: CALL_STATUS.CONNECTING });

            try {
                webRTCService.createPeerConnection({
                    onIceCandidate: (candidate) => {
                        socket.emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
                            callId,
                            candidate,
                            targetId: receiverId,
                        });
                    },
                    onRemoteStream: (remoteStream) => {
                        set({ remoteStream });
                    },
                    onConnectionState: (state) => {
                        if (state === 'connected') {
                            set({ callState: CALL_STATUS.CONNECTED });
                            get().startTimer();
                            get().emitMediaState(get().isMuted, get().isVideoOff);
                        } else if (state === 'failed' || state === 'closed') {
                            get().endCall();
                        }
                    },
                });

                const offer = await webRTCService.createOffer();
                socket.emit(VIDEO_CALL_EVENTS.OFFER, {
                    callId,
                    offer,
                    receiverId,
                });
            } catch (error) {
                toast.error('Failed to establish WebRTC connection.');
                get().endCall();
            }
        });

        // SDP Offer Received (handled on Receiver side)
        socket.on(VIDEO_CALL_EVENTS.OFFER, async ({ callId, offer, callerId }) => {
            try {
                const answer = await webRTCService.handleOffer(offer);
                socket.emit(VIDEO_CALL_EVENTS.ANSWER, {
                    callId,
                    answer,
                    callerId,
                });
            } catch (error) {
                console.error('Error handling offer:', error);
                toast.error('Failed to process call negotiation.');
                get().endCall();
            }
        });

        // SDP Answer Received (handled on Caller side)
        socket.on(VIDEO_CALL_EVENTS.ANSWER, async ({ answer }) => {
            try {
                await webRTCService.handleAnswer(answer);
            } catch (error) {
                console.error('Error handling answer:', error);
                toast.error('Failed to complete call connection.');
                get().endCall();
            }
        });

        // ICE Candidate Received
        socket.on(VIDEO_CALL_EVENTS.ICE_CANDIDATE, async ({ candidate }) => {
            if (candidate) {
                await webRTCService.addIceCandidate(candidate);
            }
        });

        // Peer Media State Toggle (Mic / Camera toggle)
        socket.on(VIDEO_CALL_EVENTS.MEDIA_STATE_TOGGLE, ({ isMuted, isVideoOff }) => {
            set({
                peerIsMuted: isMuted,
                peerIsVideoOff: isVideoOff,
            });
        });

        // Call Rejected
        socket.on(VIDEO_CALL_EVENTS.REJECTED, () => {
            toast.error('Call was rejected.');
            get().resetCallState();
        });

        // Call Cancelled by Caller
        socket.on(VIDEO_CALL_EVENTS.CANCELLED, () => {
            toast('Call was cancelled.', { icon: 'ℹ️' });
            get().resetCallState();
        });

        // Call Ended
        socket.on(VIDEO_CALL_EVENTS.END, () => {
            toast('Call ended.', { icon: '📞' });
            get().resetCallState();
        });

        // Receiver Busy
        socket.on(VIDEO_CALL_EVENTS.BUSY, () => {
            toast.error('User is currently busy on another call.');
            get().resetCallState();
        });

        // Video Call Error
        socket.on(VIDEO_CALL_EVENTS.ERROR, ({ message }) => {
            toast.error(message || 'Video call error occurred.');
            get().resetCallState();
        });
    },

    unsubscribeFromVideoCallSocket: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            Object.values(VIDEO_CALL_EVENTS).forEach((event) => {
                socket.off(event);
            });
        }
        set({ isSubscribed: false });
    },
}));
