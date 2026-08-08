import React from 'react'
import { useChatStore } from '../store/useChatStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { X } from 'lucide-react'

const ChatHeader = ({ onOpenUserInfo, onOpenPhotoPreview }) => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
        <div className='p-2.5 border-b border-base-300 select-none'>
            <div className='flex items-center justify-between'>
                {/* Clickable Header Bar area */}
                <div 
                  className='flex items-center gap-3 cursor-pointer hover:bg-base-200/60 p-1.5 rounded-xl transition flex-1 mr-2'
                  onClick={() => onOpenUserInfo && onOpenUserInfo()}
                  title="Click to view user information"
                >
                    {/* Avatar */}
                    <div 
                      className='avatar cursor-pointer group relative'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenPhotoPreview) {
                          onOpenPhotoPreview(selectedUser.profilePic || "/avatar.png", selectedUser.fullname);
                        }
                      }}
                      title="Click to preview photo"
                    >
                        <div className='size-10 rounded-full relative group-hover:scale-105 transition-transform overflow-hidden border border-base-300'>
                            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullname} />
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className='font-medium text-base-content hover:underline'>{selectedUser.fullname}</h3>
                        <p className='text-xs text-base-content/70 flex items-center gap-1.5'>
                            <span className={`size-2 rounded-full ${isOnline ? "bg-green-500" : "bg-zinc-500"}`}></span>
                            {isOnline ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className='btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content'
                >
                    <X className='cursor-pointer' size={20} />
                </button>
            </div>
        </div>
    )
}

export default ChatHeader
