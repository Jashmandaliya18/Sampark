import React, { useEffect, useRef } from 'react';
import { VideoOff, MicOff } from 'lucide-react';

const LocalVideo = ({ stream, isVideoOff, isMuted, className = '' }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isVideoOff]);

    return (
        <div className={`relative overflow-hidden bg-base-300 rounded-2xl shadow-lg border border-base-content/10 ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-4">
                    <VideoOff size={32} className="mb-2 opacity-60 text-red-400" />
                    <span className="text-xs font-medium text-zinc-300">Camera Off</span>
                </div>
            )}

            {/* User Label & Mic Muted Status Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium tracking-wide">
                    You
                </div>
                {isMuted && (
                    <div className="bg-red-600/90 text-white p-1 rounded-full shadow-md" title="Your microphone is muted">
                        <MicOff size={12} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalVideo;
