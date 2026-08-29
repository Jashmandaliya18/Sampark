import React from 'react';

const MobileContactRow = ({ user, isOnline, isSelected, onSelect }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(user)}
            className={`w-full min-h-[64px] px-4 py-3 flex items-center gap-3.5 hover:bg-base-200/70 active:bg-base-300 transition-colors border-b border-base-200/50 cursor-pointer select-none text-left ${
                isSelected ? 'bg-base-200/80 ring-1 ring-primary/20' : ''
            }`}
            aria-label={`Open conversation with ${user.fullname}`}
        >
            {/* Avatar container */}
            <div className="relative shrink-0">
                <img
                    src={user.profilePic || '/avatar.png'}
                    alt={user.fullname}
                    className="size-12 object-cover rounded-full border border-base-300 shadow-sm"
                />
            </div>

            {/* User Details with Proper Text Truncation */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-base text-base-content truncate tracking-tight">
                        {user.fullname}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    <span className={`text-xs font-medium ${isOnline ? 'text-emerald-500' : 'text-base-content/60'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>
        </button>
    );
};

export default MobileContactRow;
