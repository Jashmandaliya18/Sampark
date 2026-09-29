import React, { useRef, useEffect } from 'react';
import RemoteVideo from './RemoteVideo.jsx';
import DraggableLocalVideo from './DraggableLocalVideo.jsx';
import CallControls from './CallControls.jsx';
import { CALL_STATUS } from '../utils/videoCallConstants.js';
import { PhoneOff, MicOff, ScreenShare, User } from 'lucide-react';

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
    screenStream,
    isMuted,
    isVideoOff,
    peerIsMuted,
    peerIsVideoOff,
    isScreenSharing,
    peerIsScreenSharing,
    callDuration,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onEndCall,
    onCancelCall,
}) => {
    const containerRef = useRef(null);
    const screenPreviewRef = useRef(null);
    const peerMiniVideoRef = useRef(null);

    const isCallingOrRinging = callState === CALL_STATUS.CALLING || callState === CALL_STATUS.RINGING;
    const isConnecting = callState === CALL_STATUS.CONNECTING;
    const isConnected = callState === CALL_STATUS.CONNECTED;

    // Attach local screen share stream to screen preview element
    useEffect(() => {
        if (screenPreviewRef.current && screenStream) {
            screenPreviewRef.current.srcObject = screenStream;
            screenPreviewRef.current.play().catch((err) => {
                console.warn('Screen preview play warning:', err);
            });
        }
    }, [screenStream, isScreenSharing]);

    // Attach peer remote stream to mini preview when local user is sharing screen
    useEffect(() => {
        if (peerMiniVideoRef.current && remoteStream) {
            peerMiniVideoRef.current.srcObject = remoteStream;
            peerMiniVideoRef.current.play().catch((err) => {
                console.warn('Mini peer video play warning:', err);
            });
        }
    }, [remoteStream, isScreenSharing, peerIsVideoOff]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white overflow-hidden animate-fade-in select-none">
            {/* Main Video Display: Screen Preview (if user is sharing) OR Remote Video */}
            {isScreenSharing ? (
                <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                    <video
                        ref={screenPreviewRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-20 left-4 sm:left-6 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/10 shadow-lg pointer-events-none z-10 animate-fade-in">
                        <ScreenShare size={14} className="text-emerald-400" />
                        <span>Your Shared Screen</span>
                    </div>
                </div>
            ) : (
                <RemoteVideo
                    stream={remoteStream}
                    peerName={peerUser?.fullname || 'Remote Participant'}
                    peerAvatar={peerUser?.profilePic || ''}
                    peerIsVideoOff={peerIsVideoOff}
                    peerIsScreenSharing={peerIsScreenSharing}
                    className="w-full h-full"
                />
            )}

            {/* Clean Single Top Header Bar (Safe-Area Aware, Zero Overlap) */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10 pointer-events-none pt-[env(safe-area-inset-top,0px)]">
                {/* Left: Participant Info */}
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 pointer-events-auto shadow-xl max-w-[70%] sm:max-w-[60%]">
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
                    {peerIsScreenSharing && (
                        <div className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 animate-pulse" title="Peer is sharing screen">
                            <ScreenShare size={12} />
                            <span>Screen</span>
                        </div>
                    )}
                </div>

                {/* Right: Active Local Screen Share Banner with Quick Stop Button */}
                {isScreenSharing && (
                    <div className="flex items-center gap-2 bg-emerald-600/90 text-white backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-400/30 pointer-events-auto shadow-xl text-xs sm:text-sm font-semibold animate-fade-in">
                        <ScreenShare size={16} className="text-emerald-200" />
                        <span className="hidden md:inline">You are sharing your screen</span>
                        <span className="md:hidden">Sharing</span>
                        <button
                            onClick={onToggleScreenShare}
                            className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-2.5 h-6 min-h-0 cursor-pointer ml-1 shadow-md hover:scale-105 transition"
                            title="Stop Sharing"
                        >
                            Stop
                        </button>
                    </div>
                )}
            </div>

            {/* When local user is sharing screen: Floating Preview of Remote Participant */}
            {isScreenSharing && isConnected && (
                <div className="absolute top-20 right-4 sm:right-6 z-20 w-32 h-24 sm:w-40 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-900 pointer-events-auto">
                    <video
                        ref={peerMiniVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${peerIsVideoOff ? 'hidden' : 'block'}`}
                    />
                    {peerIsVideoOff && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-2 text-center">
                            <User size={22} className="mb-1 text-zinc-500" />
                            <span className="text-[10px] font-medium text-zinc-400 truncate max-w-[90%]">{peerUser?.fullname}</span>
                        </div>
                    )}
                    <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-white font-medium truncate max-w-[85%]">
                        {peerUser?.fullname || 'Participant'}
                    </div>
                </div>
            )}

            {/* Draggable Local Video Preview Container (Camera Self View) */}
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
                        isScreenSharing={isScreenSharing}
                        onToggleMic={onToggleMic}
                        onToggleCamera={onToggleCamera}
                        onToggleScreenShare={onToggleScreenShare}
                        onEndCall={onEndCall}
                    />
                </div>
            )}
        </div>
    );
};

export default CallWindow;
