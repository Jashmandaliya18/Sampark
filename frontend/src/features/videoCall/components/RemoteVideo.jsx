import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

const RemoteVideo = ({ stream, peerName = 'Remote User', peerAvatar = '', className = '' }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const hasVideoTrack = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

    return (
        <div className={`relative overflow-hidden bg-zinc-950 flex items-center justify-center ${className}`}>
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-300 ${hasVideoTrack ? 'opacity-100' : 'opacity-0'}`}
                />
            ) : null}

            {(!stream || !hasVideoTrack) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 text-white p-6">
                    <div className="avatar mb-4 animate-pulse">
                        <div className="w-24 h-24 rounded-full ring-4 ring-primary/40 shadow-2xl overflow-hidden bg-base-300 flex items-center justify-center">
                            {peerAvatar ? (
                                <img src={peerAvatar} alt={peerName} className="object-cover w-full h-full" />
                            ) : (
                                <User size={48} className="text-zinc-400" />
                            )}
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold tracking-wide text-zinc-100">{peerName}</h3>
                    <p className="text-xs text-zinc-400 mt-1">Audio connected • Camera disabled</p>
                </div>
            )}

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-medium flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{peerName}</span>
            </div>
        </div>
    );
};

export default RemoteVideo;
