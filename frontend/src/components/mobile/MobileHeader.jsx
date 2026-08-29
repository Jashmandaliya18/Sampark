import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, MoreVertical, Settings, User, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';

const MobileHeader = () => {
    const { logout, isLoggingOut } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between select-none shrink-0 shadow-sm">
            {/* Sampark Brand Title */}
            <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="size-5" />
                </div>
                <h1 className="text-xl font-bold text-base-content tracking-tight">Sampark</h1>
            </div>

            {/* Right Quick Menu Options */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content cursor-pointer"
                    title="Menu"
                    aria-label="Open menu options"
                >
                    <MoreVertical size={20} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-10 z-50 w-48 bg-base-100 border border-base-300 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150">
                        <Link
                            to="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition"
                        >
                            <Settings size={16} className="text-base-content/70" />
                            <span>Settings</span>
                        </Link>

                        <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition"
                        >
                            <User size={16} className="text-base-content/70" />
                            <span>Profile</span>
                        </Link>

                        <div className="my-1 border-t border-base-300" />

                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                logout();
                            }}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-base-200 transition disabled:opacity-50 text-left"
                        >
                            {isLoggingOut ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LogOut size={16} />
                            )}
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default MobileHeader;
