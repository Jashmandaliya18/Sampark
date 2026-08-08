import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';
import UserInfoModal from './UserInfoModal.jsx';
import ProfilePhotoModal from './ProfilePhotoModal.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { formateMessageTime } from "../lib/utils.js";
import { Smile, Plus, MessageSquare, Sparkles } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const QUICK_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ChatContainer = () => {
  const { 
    message, 
    getMessages, 
    isMessagesLoading, 
    selectedUser, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    reactToMessage,
    sendMessages
  } = useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore();

  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState({ isOpen: false, url: '', title: '' });
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
  const [showFullEmojiPickerId, setShowFullEmojiPickerId] = useState(null);

  const messageEndRef = useRef(null);
  const touchTimerRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, socket, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && message) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (activeReactionMessageId || showFullEmojiPickerId) && 
        !e.target.closest('.reaction-container')
      ) {
        setActiveReactionMessageId(null);
        setShowFullEmojiPickerId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeReactionMessageId, showFullEmojiPickerId]);

  const handleOpenPhotoPreview = (photoUrl, title = "Profile Photo") => {
    setPhotoPreview({
      isOpen: true,
      url: photoUrl,
      title: title
    });
  };

  const handleTouchStart = (msgId) => {
    touchTimerRef.current = setTimeout(() => {
      setActiveReactionMessageId(msgId);
    }, 400); // 400ms long press for mobile
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  const handleReactionClick = async (msgId, emoji) => {
    setActiveReactionMessageId(null);
    setShowFullEmojiPickerId(null);
    await reactToMessage(msgId, emoji);
  };

  const handleQuickSayHi = async () => {
    await sendMessages({ text: "Hi 👋" });
  };

  const isOnline = onlineUsers.map(String).includes(String(selectedUser._id));

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

      <div className='flex-1 overflow-y-auto p-4 space-y-6 flex flex-col justify-start'>
        {message.length === 0 ? (
          /* Empty Chat Placeholder UI */
          <div className="flex-1 my-auto flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none">
            <div className="relative">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                <MessageSquare className="size-9 text-primary animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-base-100 p-1.5 rounded-full border border-base-300 shadow-md">
                <Sparkles className="size-4 text-amber-400" />
              </div>
            </div>

            <div className="max-w-xs space-y-1">
              <h3 className="text-lg font-bold text-base-content">No conversation yet</h3>
              <p className="text-xs text-base-content/60 leading-relaxed">
                Say 👋 Hi to start the conversation with <span className="font-semibold text-base-content">{selectedUser.fullname}</span>!
              </p>
            </div>

            <button
              onClick={handleQuickSayHi}
              className="btn btn-primary btn-sm rounded-full px-5 gap-2 shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <span>Say Hi 👋</span>
            </button>
          </div>
        ) : (
          message.map((msg) => {
            const isMe = String(msg.senderId) === String(authUser._id);
            const senderName = isMe ? authUser.fullname : selectedUser.fullname;
            const avatarPic = isMe ? (authUser.profilePic || "/avatar.png") : (selectedUser.profilePic || "/avatar.png");
            const reactions = msg.reactions || [];

            // Group reactions by emoji
            const reactionCounts = reactions.reduce((acc, curr) => {
              acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
              return acc;
            }, {});

            const userReaction = reactions.find(r => String(r.userId) === String(authUser._id))?.emoji;

            return (
              <div
                key={msg._id}
                className={`chat ${isMe ? "chat-end" : "chat-start"} group relative`}
                ref={messageEndRef}
              >
                {/* Avatar */}
                <div 
                  className='chat-image avatar cursor-pointer hover:opacity-85 transition'
                  onClick={() => handleOpenPhotoPreview(avatarPic, senderName)}
                  title="Click to preview photo"
                >
                  <div className='size-10 rounded-full border border-base-300 overflow-hidden cursor-pointer'>
                    <img
                      src={avatarPic}
                      alt="ProfilePic" 
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <div className='chat-header mb-1'>
                  <time className='text-xs opacity-50 ml-1'>
                    {formateMessageTime(msg.createdAt)}
                  </time>
                </div>

                {/* Message Content Container & Reaction Floating Bar */}
                <div className="relative inline-block max-w-[85%] sm:max-w-[70%] min-w-[60px] reaction-container">
                  {/* Floating WhatsApp-style Quick Emoji Bar */}
                  {activeReactionMessageId === msg._id && (
                    <div 
                      className={`absolute -top-12 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-base-300/95 border border-base-200 shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {QUICK_REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactionClick(msg._id, emoji);
                          }}
                          className={`hover:scale-125 active:scale-95 transition-transform text-lg cursor-pointer px-1 py-0.5 rounded-full hover:bg-base-100/60 ${
                            userReaction === emoji ? "bg-primary/20 scale-110" : ""
                          }`}
                          title={`React ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Plus button to open full emoji picker */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullEmojiPickerId(
                            showFullEmojiPickerId === msg._id ? null : msg._id
                          );
                        }}
                        className="hover:scale-110 active:scale-95 transition-transform cursor-pointer p-1.5 rounded-full bg-base-200 hover:bg-base-100 text-base-content/80"
                        title="More emojis"
                      >
                        <Plus size={16} className="cursor-pointer" />
                      </button>

                      {/* Remove reaction button if user has reacted */}
                      {userReaction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactionClick(msg._id, "❌");
                          }}
                          className="hover:scale-110 active:scale-95 transition-transform cursor-pointer p-1 rounded-full text-xs hover:bg-base-100/60 text-error"
                          title="Remove reaction"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  )}

                  {/* Full Emoji Picker Popover for Reaction */}
                  {showFullEmojiPickerId === msg._id && (
                    <div 
                      className={`absolute bottom-12 z-50 shadow-2xl rounded-2xl border border-base-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      <EmojiPicker 
                        onEmojiClick={(emojiData) => handleReactionClick(msg._id, emojiData.emoji)}
                        theme={Theme.DARK}
                        width={310}
                        height={360}
                        searchDisabled={false}
                        skinTonesDisabled
                      />
                    </div>
                  )}

                  {/* Main Chat Bubble with WhatsApp-style width scaling */}
                  <div 
                    className={`chat-bubble flex flex-col relative select-text cursor-pointer max-w-full w-fit whitespace-pre-wrap leading-relaxed py-2 px-3.5 ${
                      isMe ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"
                    }`}
                    onTouchStart={() => handleTouchStart(msg._id)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Laptop Hover Reaction Trigger Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReactionMessageId(
                          activeReactionMessageId === msg._id ? null : msg._id
                        );
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-base-300/80 hover:bg-base-300 text-base-content/70 hover:text-base-content cursor-pointer shadow-md ${
                        isMe ? "-left-8" : "-right-8"
                      }`}
                      title="Add reaction"
                    >
                      <Smile size={16} className="cursor-pointer" />
                    </button>

                    {/* Image Attachment */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Attachment"
                        className='sm:max-w-[280px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition'
                        onClick={() => handleOpenPhotoPreview(msg.image, "Attachment")}
                      />
                    )}

                    {/* Text Message */}
                    {msg.text && (
                      <p className="break-words whitespace-pre-wrap inline-block leading-snug">
                        {msg.text}
                      </p>
                    )}
                  </div>

                  {/* Reaction Pill Badge (Display active reactions below message bubble) */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <div 
                      className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-base-300/90 border border-base-200 shadow-sm text-xs w-fit cursor-pointer ${
                        isMe ? 'ml-auto' : 'mr-auto'
                      }`}
                      onClick={() => setActiveReactionMessageId(msg._id)}
                      title="View / Change reaction"
                    >
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center gap-0.5">
                          <span>{emoji}</span>
                          {count > 1 && <span className="text-[10px] font-semibold text-base-content/80">{count}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
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
