import React, { useState, useRef } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import { X, Image, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = useChatStore()

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessages({ text: text.trim(), image: imagePreview });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      toast.error("Failed to send message: ", error);
    }
  };

  return (
    <div className='p-4 w-full '>
      {imagePreview && (
        <div className='mb-3 flex items-center gap-2'>
          <div className='relative'>
            <img
              src={imagePreview}
              alt="Preview"
              className='size-20 object-cover rounded-lg border border-zinc-700' />
            <button
              className='absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center cursor-pointer'
              onClick={removeImage}
              type='button'>
              <X className='size-3' />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            className=" w-full px-4 pr-20 py-3 rounded-xl bg-base-200 border border-base-300 text-base-content placeholder:text-base-content/40 caret-base-content/80 focus:outline-none focus:border-base-content/25 focus:bg-base-200 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Image Button (inside input) */}
          <button
            type="button"
            className=" absolute right-12 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content/80 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={18} />
          </button>

          {/* Send Button (inside input) */}
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-content/5 hover:bg-base-content/10 text-base-content/70 disabled:opacity-30 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
