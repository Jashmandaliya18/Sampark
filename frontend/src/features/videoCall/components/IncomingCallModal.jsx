import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

const IncomingCallModal = ({ caller, onAccept, onReject }) => {
    if (!caller) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
                {/* Subtle pulse background effect */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full ring-4 ring-primary/50 overflow-hidden shadow-xl animate-pulse">
                        <img
                            src={caller.profilePic || '/avatar.png'}
                            alt={caller.fullname || 'Caller'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full shadow-md">
                        <Video size={16} />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{caller.fullname || 'Unknown User'}</h3>
                <p className="text-xs text-zinc-400 mb-8 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Incoming Video Call...
                </p>

                <div className="flex items-center justify-center gap-8 w-full">
                    {/* Decline Button */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onReject}
                            className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 text-white border-none shadow-lg hover:scale-110 transition-all duration-200"
                            title="Decline Call"
                        >
                            <PhoneOff size={24} />
                        </button>
                        <span className="text-xs font-medium text-zinc-400">Decline</span>
                    </div>

                    {/* Accept Button */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={onAccept}
                            className="btn btn-circle btn-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg hover:scale-110 transition-all duration-200 animate-bounce"
                            title="Accept Call"
                        >
                            <Phone size={24} />
                        </button>
                        <span className="text-xs font-medium text-zinc-400">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
