import React from 'react'
import { X, User, Mail, Calendar, Activity, Eye } from 'lucide-react'

const UserInfoModal = ({ isOpen, onClose, user, isOnline, onOpenPhotoPreview }) => {
  if (!isOpen || !user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-base-100 border border-base-300 rounded-2xl p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-base-300 pb-3">
          <h2 className="text-xl font-bold text-base-content">User Information</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div 
            className="relative group cursor-pointer"
            onClick={() => onOpenPhotoPreview(user.profilePic || "/avatar.png", user.fullname)}
            title="Click to view full photo"
          >
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullname}
              className="size-28 rounded-full border-4 border-base-300 object-cover group-hover:opacity-85 transition-all group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="text-white size-7" />
            </div>
            <div 
              className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-base-100 ${
                isOnline ? "bg-green-500" : "bg-zinc-500"
              }`}
            />
          </div>
          <p className="text-xs text-base-content/60">Click picture to enlarge</p>
        </div>

        {/* Information List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300">
            <div className="p-2 rounded-lg bg-base-300 text-base-content/80">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">Full Name</p>
              <p className="text-sm font-semibold text-base-content">{user.fullname}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300">
            <div className="p-2 rounded-lg bg-base-300 text-base-content/80">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-base-content">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300">
            <div className="p-2 rounded-lg bg-base-300 text-base-content/80">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">Status</p>
              <p className={`text-sm font-semibold ${isOnline ? "text-green-500" : "text-base-content/60"}`}>
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/60 border border-base-300">
            <div className="p-2 rounded-lg bg-base-300 text-base-content/80">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">Member Since</p>
              <p className="text-sm font-semibold text-base-content">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button 
            onClick={onClose} 
            className="w-full btn btn-primary rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserInfoModal
