import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore.js'
import { Camera, User, Mail } from "lucide-react"

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(null);


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

  return (
    <div className='min-h-screen pt-20 bg-base-200'>
      <div className='max-w-lg mx-auto px-4'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>

          {/* Header */}
          <div className='text-center'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='text-sm text-zinc-400 mt-1'>Your profile information</p>
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
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }`}
              >
                <Camera className='w-5 h-5 text-base-200' />
                <input type="file" id="avatar-upload" className='hidden' accept='image/*' onChange={handleImageUpload} disabled={isUpdatingProfile} />
              </label>
            </div>

            <p className='text-xs text-zinc-400'>
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User Info */}
          <div className='space-y-5'>
            <div>
              <label className='flex items-center gap-2 text-sm text-zinc-400 mb-1'>
                <User className='size-4' />
                Full Name
              </label>
              <div className='px-4 py-2.5 rounded-lg bg-base-200 border border-zinc-700'>
                {authUser?.fullname}
              </div>
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm text-zinc-400 mb-1'>
                <Mail className='size-4' />
                Email
              </label>
              <div className='px-4 py-2.5 rounded-lg bg-base-200 border border-zinc-700'>
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
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-zinc-400'>Account Status</span>
                <span className='text-green-500'>Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
