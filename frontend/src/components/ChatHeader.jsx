import React from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { useVideoCallStore } from '../features/videoCall/store/useVideoCallStore.js';
import { useMobileNavigation } from '../hooks/useMobileNavigation.js';
import { X, Video, ArrowLeft } from 'lucide-react';

const ChatHeader = ({ onOpenUserInfo, onOpenPhotoPreview }) => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { initiateCall } = useVideoCallStore();
    const { handleBack } = useMobileNavigation(true);

    if (!selectedUser) return null;

    const isOnline = onlineUsers.map(String).includes(String(selectedUser._id));

    return (
        <div className="px-3 py-2.5 border-b border-base-300 select-none bg-base-100/90 backdrop-blur-md shrink-0 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                {/* Back button for mobile & tablet view */}
                <button
                    onClick={handleBack}
                    className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-base-content cursor-pointer shrink-0"
                    title="Back to contacts list"
                    aria-label="Go back to contacts list"
                >
                    <ArrowLeft size={20} className="cursor-pointer" />
                </button>

                {/* Clickable Header Bar area */}
                <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-base-200/60 p-1 rounded-xl transition flex-1 min-w-0"
                    onClick={() => onOpenUserInfo && onOpenUserInfo()}
                    title="Click to view user information"
                >
                    {/* Avatar */}
                    <div
                        className="avatar cursor-pointer group relative shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenPhotoPreview) {
                                onOpenPhotoPreview(selectedUser.profilePic || '/avatar.png', selectedUser.fullname);
                            }
                        }}
                        title="Click to preview photo"
                    >
                        <div className="size-10 rounded-full relative group-hover:scale-105 transition-transform overflow-hidden border border-base-300 cursor-pointer">
                            <img
                                src={selectedUser.profilePic || '/avatar.png'}
                                alt={selectedUser.fullname}
                                className="cursor-pointer object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="cursor-pointer min-w-0 flex-1">
                        <h3 className="font-semibold text-base-content hover:underline cursor-pointer truncate text-sm sm:text-base leading-tight">
                            {selectedUser.fullname}
                        </h3>
                        <p className="text-xs text-base-content/70 flex items-center gap-1.5 cursor-pointer mt-0.5">
                            <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                            <span className={isOnline ? 'text-emerald-500 font-medium' : ''}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Video Call Button */}
                    <button
                        onClick={() => initiateCall(selectedUser)}
                        className="btn btn-ghost btn-circle btn-sm text-primary hover:bg-primary/10 cursor-pointer"
                        title="Start Video Call"
                        aria-label="Start video call"
                    >
                        <Video className="cursor-pointer" size={20} />
                    </button>

                    {/* Close Button (Desktop) */}
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content cursor-pointer hidden lg:flex"
                        title="Close conversation"
                        aria-label="Close conversation"
                    >
                        <X className="cursor-pointer" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
