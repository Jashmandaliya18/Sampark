import React from 'react';
import RemoteVideo from './RemoteVideo.jsx';
import LocalVideo from './LocalVideo.jsx';
import CallControls from './CallControls.jsx';
import { CALL_STATUS } from '../utils/videoCallConstants.js';
import { PhoneOff } from 'lucide-react';

const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CallWindow = ({
    callState,
    peerUser,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    peerIsMuted,
    peerIsVideoOff,
    callDuration,
    onToggleMic,
    onToggleCamera,
    onEndCall,
    onCancelCall,
}) => {
    const isCallingOrRinging = callState === CALL_STATUS.CALLING || callState === CALL_STATUS.RINGING;
    const isConnecting = callState === CALL_STATUS.CONNECTING;
    const isConnected = callState === CALL_STATUS.CONNECTED;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white overflow-hidden animate-fade-in">
            {/* Main Remote Video Container */}
            <RemoteVideo
                stream={remoteStream}
                peerName={peerUser?.fullname || 'Remote Participant'}
                peerAvatar={peerUser?.profilePic || ''}
                peerIsMuted={peerIsMuted}
                peerIsVideoOff={peerIsVideoOff}
                className="w-full h-full"
            />

            {/* Top Bar Header */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300">
                        <img
                            src={peerUser?.profilePic || '/avatar.png'}
                            alt={peerUser?.fullname || 'User'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white leading-tight">
                            {peerUser?.fullname || 'User'}
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-medium">
                            {isCallingOrRinging && 'Calling...'}
                            {isConnecting && 'Connecting media stream...'}
                            {isConnected && `In call • ${formatDuration(callDuration)}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Local Video PIP Preview */}
            <div className="absolute bottom-28 right-6 z-20 w-36 h-48 md:w-48 md:h-64 shadow-2xl">
                <LocalVideo
                    stream={localStream}
                    isVideoOff={isVideoOff}
                    isMuted={isMuted}
                    className="w-full h-full"
                />
            </div>

            {/* Outgoing Call / Connecting Overlay */}
            {isCallingOrRinging && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md text-center p-6">
                    <div className="avatar mb-6 relative">
                        <div className="w-28 h-28 rounded-full ring-4 ring-primary/40 overflow-hidden shadow-2xl animate-pulse">
                            <img
                                src={peerUser?.profilePic || '/avatar.png'}
                                alt={peerUser?.fullname}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{peerUser?.fullname}</h2>
                    <p className="text-sm text-zinc-400 mb-8 animate-pulse">Ringing...</p>

                    <button
                        onClick={onCancelCall}
                        className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 transition"
                        title="Cancel Call"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            )}

            {/* Bottom Controls Bar */}
            {isConnected && (
                <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-auto">
                    <CallControls
                        isMuted={isMuted}
                        isVideoOff={isVideoOff}
                        onToggleMic={onToggleMic}
                        onToggleCamera={onToggleCamera}
                        onEndCall={onEndCall}
                    />
                </div>
            )}
        </div>
    );
};

export default CallWindow;
