import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, ScreenShareOff } from 'lucide-react';

const CallControls = ({
    isMuted,
    isVideoOff,
    isScreenSharing,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onEndCall,
}) => {
    return (
        <div className="flex items-center justify-center gap-3 sm:gap-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-2xl">
            {/* Microphone Toggle */}
            <button
                onClick={onToggleMic}
                className={`btn btn-circle btn-md sm:btn-lg border-none transition-all duration-200 cursor-pointer ${
                    isMuted
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Camera Toggle */}
            <button
                onClick={onToggleCamera}
                className={`btn btn-circle btn-md sm:btn-lg border-none transition-all duration-200 cursor-pointer ${
                    isVideoOff
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                aria-label={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* Screen Share Toggle */}
            <button
                onClick={onToggleScreenShare}
                className={`btn btn-circle btn-md sm:btn-lg border-none transition-all duration-200 cursor-pointer ${
                    isScreenSharing
                        ? 'bg-primary text-primary-content hover:bg-primary/90 ring-2 ring-primary/50 shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
                aria-label={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
            >
                {isScreenSharing ? <ScreenShareOff size={22} /> : <ScreenShare size={22} />}
            </button>

            {/* End Call */}
            <button
                onClick={onEndCall}
                className="btn btn-circle btn-md sm:btn-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                title="End Call"
                aria-label="End Call"
            >
                <PhoneOff size={24} />
            </button>
        </div>
    );
};

export default CallControls;
