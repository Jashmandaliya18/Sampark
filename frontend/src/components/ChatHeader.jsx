import React from 'react'
import { useChatStore } from '../store/useChatStore.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { X } from 'lucide-react'

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    return (
        <div className='p-2.5 border-b border-base-300'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    {/* Avatar */}
                    <div className='avatar'>
                        <div className='size-10 rounded-full relative'>
                            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullname} />
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className='font-medium'>{selectedUser.fullname}</h3>
                        <p className='text-sm text-base-content/70'>
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={() => setSelectedUser(null)}>
                    <X className='cursor-pointer' />
                </button>
            </div>
        </div>
    )
}

export default ChatHeader
