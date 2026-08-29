export const VIDEO_CALL_EVENTS = {
    REQUEST: 'video-call:request',
    ACCEPTED: 'video-call:accepted',
    REJECTED: 'video-call:rejected',
    CANCELLED: 'video-call:cancelled',
    OFFER: 'video-call:offer',
    ANSWER: 'video-call:answer',
    ICE_CANDIDATE: 'video-call:ice-candidate',
    END: 'video-call:end',
    BUSY: 'video-call:busy',
    ERROR: 'video-call:error',
};

export const CALL_STATUS = {
    IDLE: 'IDLE',
    CALLING: 'CALLING',
    RINGING: 'RINGING',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    ENDED: 'ENDED',
    BUSY: 'BUSY',
    FAILED: 'FAILED',
};

const getIceServers = () => {
    const stunUrl = import.meta.env.VITE_WEBRTC_STUN_URL || 'stun:stun.l.google.com:19302';
    const turnUrl = import.meta.env.VITE_WEBRTC_TURN_URL;
    const turnUsername = import.meta.env.VITE_WEBRTC_TURN_USERNAME;
    const turnCredential = import.meta.env.VITE_WEBRTC_TURN_CREDENTIAL;

    const iceServers = [
        { urls: stunUrl },
        { urls: 'stun:stun1.l.google.com:19302' },
    ];

    if (turnUrl) {
        iceServers.push({
            urls: turnUrl,
            username: turnUsername || '',
            credential: turnCredential || '',
        });
    }

    return iceServers;
};

export const RTC_CONFIGURATION = {
    iceServers: getIceServers(),
    iceCandidatePoolSize: 10,
};
