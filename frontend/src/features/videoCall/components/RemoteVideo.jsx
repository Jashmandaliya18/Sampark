import React, { useEffect, useRef } from 'react';
import { User, VideoOff, ScreenShare } from 'lucide-react';

const RemoteVideo = ({
    stream,
    peerName = 'Remote User',
    peerAvatar = '',
    peerIsVideoOff = false,
    peerIsScreenSharing = false,
    className = '',
}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => {
                console.warn('Remote video playback error:', err);
            });
        }
    }, [stream, peerIsVideoOff, peerIsScreenSharing]);

    const isDisplayingVideo = stream && (!peerIsVideoOff || peerIsScreenSharing);

    return (
        <div className={`relative overflow-hidden bg-zinc-950 flex items-center justify-center ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full transition-all duration-300 ${
                    peerIsScreenSharing ? 'object-contain bg-black' : 'object-cover'
                } ${isDisplayingVideo ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Peer Screen Sharing Badge */}
            {peerIsScreenSharing && isDisplayingVideo && (
                <div className="absolute top-20 left-4 sm:left-6 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/10 shadow-lg pointer-events-none z-10 animate-fade-in">
                    <ScreenShare size={14} className="text-primary" />
                    <span>{peerName}&apos;s Screen</span>
                </div>
            )}

            {!isDisplayingVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 text-white p-6">
                    <div className="avatar mb-4 relative">
                        <div className="w-28 h-28 rounded-full ring-4 ring-primary/40 shadow-2xl overflow-hidden bg-base-300 flex items-center justify-center">
                            {peerAvatar ? (
                                <img src={peerAvatar} alt={peerName} className="object-cover w-full h-full" />
                            ) : (
                                <User size={56} className="text-zinc-400" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg border border-zinc-900">
                            <VideoOff size={16} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold tracking-wide text-zinc-100">{peerName}</h3>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Camera is turned off
                    </p>
                </div>
            )}
        </div>
    );
};

export default RemoteVideo;
