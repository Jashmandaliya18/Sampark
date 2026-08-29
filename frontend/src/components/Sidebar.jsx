import React, { useEffect, useState } from 'react'
import { useChatStore } from "../store/useChatStore.js"
import { useAuthStore } from '../store/useAuthStore.js';
import SidebarSkeleton from '../components/skeletons/SidebarSkeleton.jsx';
import MobileHeader from './mobile/MobileHeader.jsx';
import MobileContactRow from './mobile/MobileContactRow.jsx';
import { Users, Search, X } from "lucide-react"

const Sidebar = ({ isMobile = false }) => {
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
    <aside className='h-full w-full border-r border-base-300 flex flex-col transition-all duration-200 select-none bg-base-100 overflow-hidden'>
      {/* Mobile Top Header */}
      {isMobile && <MobileHeader />}

      <div className='border-b border-base-300 w-full p-4 space-y-3 shrink-0'>
        {/* Header Title (Desktop) */}
        {!isMobile && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='size-6 text-primary' />
              <span className='font-semibold text-base-content text-base'>Contacts</span>
            </div>
            <span className='text-xs text-base-content/60 font-medium'>
              {onlineOtherUsersCount} online
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className='relative w-full'>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary/50 focus:bg-base-200/80 transition cursor-text"
            aria-label="Search contacts"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="size-4 cursor-pointer" />
            </button>
          )}
        </div>

        {/* Online filter checkbox */}
        <div className='flex items-center justify-between pt-0.5'>
          <label className='cursor-pointer flex items-center gap-2 text-xs text-base-content/70 hover:text-base-content transition'>
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className='checkbox checkbox-xs rounded cursor-pointer'
            />
            <span className="cursor-pointer font-medium">Show online only</span>
          </label>
          {isMobile && (
            <span className='text-xs text-base-content/50 font-medium'>
              {onlineOtherUsersCount} online
            </span>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className='overflow-y-auto w-full flex-1 divide-y divide-base-200/40'>
        {sortedAndFilteredUsers.map((user) => {
          const isOnline = onlineUserIdsStrings.includes(String(user._id));
          return (
            <MobileContactRow
              key={user._id}
              user={user}
              isOnline={isOnline}
              isSelected={selectedUser?._id === user._id}
              onSelect={setSelectedUser}
            />
          );
        })}

        {sortedAndFilteredUsers.length === 0 && (
          <div className='text-center text-xs text-base-content/50 py-12 px-4'>
            {searchQuery ? `No contacts matching "${searchQuery}"` : "No contacts found"}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
