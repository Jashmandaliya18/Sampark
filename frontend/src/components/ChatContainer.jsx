import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';
import UserInfoModal from './UserInfoModal.jsx';
import ProfilePhotoModal from './ProfilePhotoModal.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { formateMessageTime } from "../lib/utils.js";

const ChatContainer = () => {
  const { message, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState({ isOpen: false, url: '', title: '' });

  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && message) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  const handleOpenPhotoPreview = (photoUrl, title = "Profile Photo") => {
    setPhotoPreview({
      isOpen: true,
      url: photoUrl,
      title: title
    });
  };

  const isOnline = onlineUsers.includes(selectedUser._id);

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto relative'>
        <ChatHeader 
          onOpenUserInfo={() => setIsUserInfoOpen(true)}
          onOpenPhotoPreview={handleOpenPhotoPreview}
        />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col overflow-auto relative'>
      <ChatHeader 
        onOpenUserInfo={() => setIsUserInfoOpen(true)}
        onOpenPhotoPreview={handleOpenPhotoPreview}
      />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {message.map((msg) => {
          const isMe = msg.senderId === authUser._id;
          const senderName = isMe ? authUser.fullname : selectedUser.fullname;
          const avatarPic = isMe ? (authUser.profilePic || "/avatar.png") : (selectedUser.profilePic || "/avatar.png");

          return (
            <div
              key={msg._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div 
                className='chat-image avatar cursor-pointer hover:opacity-85 transition'
                onClick={() => handleOpenPhotoPreview(avatarPic, senderName)}
                title="Click to preview photo"
              >
                <div className='size-10 rounded-full border border-base-300 overflow-hidden'>
                  <img
                    src={avatarPic}
                    alt="ProfilePic" 
                  />
                </div>
              </div>

              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50 ml-1'>
                  {formateMessageTime(msg.createdAt)}
                </time>
              </div>
              <div className='chat-bubble flex flex-col'>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Attachment"
                    className='sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition'
                    onClick={() => handleOpenPhotoPreview(msg.image, "Attachment")}
                  />
                )}
                {msg.text && <p>{msg.text}</p>}
              </div>

            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* User Information Modal */}
      <UserInfoModal 
        isOpen={isUserInfoOpen}
        onClose={() => setIsUserInfoOpen(false)}
        user={selectedUser}
        isOnline={isOnline}
        onOpenPhotoPreview={handleOpenPhotoPreview}
      />

      {/* Profile / Image Photo Preview Modal */}
      <ProfilePhotoModal 
        isOpen={photoPreview.isOpen}
        onClose={() => setPhotoPreview({ isOpen: false, url: '', title: '' })}
        photoUrl={photoPreview.url}
        title={photoPreview.title}
      />
    </div>
  );
};

export default ChatContainer;
