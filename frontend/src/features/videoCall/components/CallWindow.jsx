import React, { useRef } from 'react';
import RemoteVideo from './RemoteVideo.jsx';
import DraggableLocalVideo from './DraggableLocalVideo.jsx';
import CallControls from './CallControls.jsx';
import { CALL_STATUS } from '../utils/videoCallConstants.js';
import { PhoneOff, MicOff } from 'lucide-react';

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
    const containerRef = useRef(null);

    const isCallingOrRinging = callState === CALL_STATUS.CALLING || callState === CALL_STATUS.RINGING;
    const isConnecting = callState === CALL_STATUS.CONNECTING;
    const isConnected = callState === CALL_STATUS.CONNECTED;

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white overflow-hidden animate-fade-in select-none">
            {/* Main Remote Video Container */}
            <RemoteVideo
                stream={remoteStream}
                peerName={peerUser?.fullname || 'Remote Participant'}
                peerAvatar={peerUser?.profilePic || ''}
                peerIsVideoOff={peerIsVideoOff}
                className="w-full h-full"
            />

            {/* Clean Single Top Header Bar (Safe-Area Aware, Zero Overlap) */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10 pointer-events-none pt-[env(safe-area-inset-top,0px)]">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 pointer-events-auto shadow-xl max-w-[85%]">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300 shrink-0 border border-white/20">
                        <img
                            src={peerUser?.profilePic || '/avatar.png'}
                            alt={peerUser?.fullname || 'User'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">
                            {peerUser?.fullname || 'User'}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">
                            {isCallingOrRinging && 'Calling...'}
                            {isConnecting && 'Connecting media stream...'}
                            {isConnected && `In call • ${formatDuration(callDuration)}`}
                        </p>
                    </div>
                    {peerIsMuted && (
                        <div className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0" title="Peer microphone is muted">
                            <MicOff size={12} />
                            <span>Muted</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Draggable Local Video Preview Container */}
            <DraggableLocalVideo
                stream={localStream}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                containerRef={containerRef}
                className="w-32 h-44 sm:w-36 sm:h-48 md:w-48 md:h-64"
            />

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
                <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]">
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
