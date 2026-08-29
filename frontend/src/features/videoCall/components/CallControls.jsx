import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const CallControls = ({ isMuted, isVideoOff, onToggleMic, onToggleCamera, onEndCall }) => {
    return (
        <div className="flex items-center justify-center gap-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-full shadow-2xl">
            {/* Microphone Toggle */}
            <button
                onClick={onToggleMic}
                className={`btn btn-circle btn-lg border-none transition-all duration-200 ${
                    isMuted
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Camera Toggle */}
            <button
                onClick={onToggleCamera}
                className={`btn btn-circle btn-lg border-none transition-all duration-200 ${
                    isVideoOff
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* End Call */}
            <button
                onClick={onEndCall}
                className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-lg hover:scale-105 transition-all duration-200"
                title="End Call"
            >
                <PhoneOff size={24} />
            </button>
        </div>
    );
};

export default CallControls;
