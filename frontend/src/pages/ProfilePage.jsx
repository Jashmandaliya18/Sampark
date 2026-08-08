import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore.js'
import { Camera, User, Mail, ArrowLeft, Loader2 } from "lucide-react"
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    }
  }

  const formattedMemberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Recently";

  return (
    <div className='min-h-screen pt-20 pb-10 bg-base-200'>
      <div className='max-w-lg mx-auto px-4'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8 shadow-xl'>

          {/* Back Button + Header */}
          <div>
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 btn btn-ghost btn-sm text-base-content/80 hover:text-base-content cursor-pointer mb-4"
              title="Back to Chat"
            >
              <ArrowLeft size={18} />
              <span>Back to Chat</span>
            </button>
            <div className='text-center'>
              <h1 className='text-2xl font-semibold'>Profile</h1>
              <p className='text-sm text-zinc-400 mt-1'>Your profile information</p>
            </div>
          </div>

          {/* Avatar */}
          <div className='flex flex-col items-center gap-3'>
            <div className='relative'>
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                className='size-32 rounded-full border-4 border-zinc-700 object-cover'
                alt="profile"
              />

              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                {isUpdatingProfile ? (
                  <Loader2 className='w-5 h-5 text-base-200 animate-spin' />
                ) : (
                  <Camera className='w-5 h-5 text-base-200' />
                )}
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className='hidden' 
                  accept='image/*' 
                  onChange={handleImageUpload} 
                  disabled={isUpdatingProfile} 
                />
              </label>
            </div>

            <p className='text-xs text-zinc-400'>
              {isUpdatingProfile ? "Uploading photo..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User Info */}
          <div className='space-y-5'>
            <div>
              <label className='flex items-center gap-2 text-sm text-zinc-400 mb-1'>
                <User className='size-4' />
                Full Name
              </label>
              <div className='px-4 py-2.5 rounded-lg bg-base-200 border border-zinc-700 font-medium'>
                {authUser?.fullname}
              </div>
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm text-zinc-400 mb-1'>
                <Mail className='size-4' />
                Email Address
              </label>
              <div className='px-4 py-2.5 rounded-lg bg-base-200 border border-zinc-700 font-medium'>
                {authUser?.email}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h2 className='text-lg font-medium mb-3'>Account Information</h2>

            <div className='text-sm space-y-3'>
              <div className='flex justify-between border-b border-zinc-700 pb-2'>
                <span className='text-zinc-400'>Member Since</span>
                <span className='font-medium'>{formattedMemberSince}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-zinc-400'>Account Status</span>
                <span className='text-green-500 font-semibold'>Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
