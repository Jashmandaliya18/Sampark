import React, { useEffect, useState } from 'react'
import { useChatStore } from "../store/useChatStore.js"
import { useAuthStore } from '../store/useAuthStore.js';
import SidebarSkeleton from '../components/skeletons/SidebarSkeleton.jsx';
import { Users, Search, X } from "lucide-react"

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUserLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const onlineUserIdsStrings = onlineUsers.map(String);
  const onlineOtherUsersCount = Math.max(
    0,
    onlineUserIdsStrings.filter((id) => id !== String(authUser?._id)).length
  );

  // Filter users by search & online toggle, then sort online users to the top
  const sortedAndFilteredUsers = users
    .filter((user) => {
      const matchesSearch = 
        user.fullname.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.trim().toLowerCase()));
      const matchesOnline = showOnlineOnly ? onlineUserIdsStrings.includes(String(user._id)) : true;
      return matchesSearch && matchesOnline;
    })
    .sort((a, b) => {
      const isOnlineA = onlineUserIdsStrings.includes(String(a._id));
      const isOnlineB = onlineUserIdsStrings.includes(String(b._id));

      if (isOnlineA && !isOnlineB) return -1; // online user comes first
      if (!isOnlineA && isOnlineB) return 1;  // offline user comes after
      return 0;
    });

  if (isUserLoading) return <SidebarSkeleton />

  return (
    <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 select-none'>
      <div className='border-b border-base-300 w-full p-4 space-y-3'>
        {/* Header Title */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Users className='size-6' />
            <span className='font-semibold hidden lg:block text-base-content'>Contacts</span>
          </div>
          <span className='text-xs text-base-content/60 hidden lg:block font-medium'>
            {onlineOtherUsersCount} online
          </span>
        </div>

        {/* Search Bar (visible on larger screens) */}
        <div className='hidden lg:block relative'>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-base-200 border border-base-300 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary/50 focus:bg-base-200/80 transition cursor-text"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition cursor-pointer"
              title="Clear search"
            >
              <X className="size-4 cursor-pointer" />
            </button>
          )}
        </div>

        {/* Online filter checkbox */}
        <div className='hidden lg:flex items-center gap-2 pt-1'>
          <label className='cursor-pointer flex items-center gap-2 text-xs text-base-content/70 hover:text-base-content transition'>
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className='checkbox checkbox-xs rounded cursor-pointer'
            />
            <span className="cursor-pointer">Show online only</span>
          </label>
        </div>
      </div>

      {/* Users List */}
      <div className='overflow-y-auto w-full py-2 flex-1'>
        {sortedAndFilteredUsers.map((user) => {
          const isOnline = onlineUserIdsStrings.includes(String(user._id));
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-200/60 transition-colors cursor-pointer ${
                selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-base-300" : ""
              }`}
            >
              {/* Profile Avatar with Green Dot overlay when online */}
              <div className='relative mx-auto lg:mx-0 cursor-pointer'>
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullname}
                  className='size-12 object-cover rounded-full border border-base-300 cursor-pointer'
                />
                {isOnline && (
                  <span className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100' />
                )}
              </div>

              {/* User info - visible on larger screen */}
              <div className='hidden lg:block text-left min-w-0 flex-1 cursor-pointer'>
                <div className='font-medium truncate text-base-content text-sm cursor-pointer'>{user.fullname}</div>
                <div className='text-xs text-zinc-400 cursor-pointer'>
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {sortedAndFilteredUsers.length === 0 && (
          <div className='text-center text-xs text-base-content/50 py-8 px-4'>
            {searchQuery ? `No contacts matching "${searchQuery}"` : "No contacts found"}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
