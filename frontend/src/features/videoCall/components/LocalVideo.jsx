import React, { useEffect, useRef } from 'react';
import { VideoOff } from 'lucide-react';

const LocalVideo = ({ stream, isVideoOff, className = '' }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative overflow-hidden bg-base-300 rounded-2xl shadow-lg border border-base-content/10 ${className}`}>
            {stream && !isVideoOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-400 p-4">
                    <VideoOff size={32} className="mb-2 opacity-60" />
                    <span className="text-xs font-medium">Camera Off</span>
                </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium tracking-wide">
                You
            </div>
        </div>
    );
};

export default LocalVideo;
