import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import { X, Image, Send, Smile, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const { sendMessages } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setText((prevText) => prevText + emojiData.emoji);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imagePreview) || isSending) return;

    setIsSending(true);
    try {
      await sendMessages({ text: text.trim(), image: imagePreview });

      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      toast.error("Failed to send message: " + (error?.message || error));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='p-4 w-full relative'>
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className='absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl border border-base-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default'
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            width={330}
            height={400}
            searchDisabled={false}
            skinTonesDisabled
          />
        </div>
      )}

      {imagePreview && (
        <div className='mb-3 flex items-center gap-2'>
          <div className='relative'>
            <img
              src={imagePreview}
              alt="Preview"
              className='size-20 object-cover rounded-lg border border-zinc-700 cursor-pointer' />
            <button
              className='absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center cursor-pointer hover:bg-base-100 transition disabled:opacity-50'
              onClick={removeImage}
              type='button'
              disabled={isSending}
              title="Remove image"
            >
              <X className='size-3 cursor-pointer' />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 relative flex items-center">
          {/* Emoji Button (Inside input on left side like WhatsApp) */}
          <button
            ref={emojiButtonRef}
            type="button"
            disabled={isSending}
            className={`absolute left-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle transition cursor-pointer disabled:opacity-50 ${
              showEmojiPicker ? 'text-primary' : 'text-base-content/40 hover:text-base-content/80'
            }`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Add Emoji"
          >
            <Smile size={20} className="cursor-pointer" />
          </button>

          <input
            type="text"
            className="w-full pl-12 pr-20 py-3 rounded-xl bg-base-200 border border-base-300 text-base-content placeholder:text-base-content/40 caret-base-content/80 focus:outline-none focus:border-base-content/25 focus:bg-base-200 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition cursor-text disabled:opacity-50"
            placeholder={isSending ? "Sending message..." : "Type a message..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSending}
          />

          <input
            type="file"
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSending}
          />

          {/* Image Button (inside input on right side) */}
          <button
            type="button"
            disabled={isSending}
            className="absolute right-12 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content/80 transition cursor-pointer disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
          >
            <Image size={18} className="cursor-pointer" />
          </button>

          {/* Send Button (inside input on right side with spinning loader) */}
          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-content/5 hover:bg-base-content/10 text-base-content/70 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed"
            title="Send Message"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <Send size={18} className="cursor-pointer" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
