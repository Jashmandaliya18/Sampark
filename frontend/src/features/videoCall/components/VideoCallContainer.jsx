import React, { useEffect } from 'react';
import { useVideoCallStore } from '../store/useVideoCallStore.js';
import { useAuthStore } from '../../../store/useAuthStore.js';
import { CALL_STATUS } from '../utils/videoCallConstants.js';
import IncomingCallModal from './IncomingCallModal.jsx';
import CallWindow from './CallWindow.jsx';

const VideoCallContainer = () => {
    const { authUser, socket } = useAuthStore();
    const {
        callState,
        caller,
        receiver,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        callDuration,
        acceptCall,
        rejectCall,
        cancelCall,
        endCall,
        toggleMic,
        toggleCamera,
        subscribeToVideoCallSocket,
        unsubscribeFromVideoCallSocket,
    } = useVideoCallStore();

    useEffect(() => {
        if (authUser && socket) {
            subscribeToVideoCallSocket();
        }

        return () => {
            unsubscribeFromVideoCallSocket();
        };
    }, [authUser, socket, subscribeToVideoCallSocket, unsubscribeFromVideoCallSocket]);

    if (!authUser || callState === CALL_STATUS.IDLE) {
        return null;
    }

    const isIncomingCall = callState === CALL_STATUS.RINGING && authUser._id === receiver?._id;
    const peerUser = authUser._id === caller?._id ? receiver : caller;

    return (
        <>
            {isIncomingCall ? (
                <IncomingCallModal
                    caller={caller}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            ) : (
                <CallWindow
                    callState={callState}
                    peerUser={peerUser}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    callDuration={callDuration}
                    onToggleMic={toggleMic}
                    onToggleCamera={toggleCamera}
                    onEndCall={endCall}
                    onCancelCall={cancelCall}
                />
            )}
        </>
    );
};

export default VideoCallContainer;
