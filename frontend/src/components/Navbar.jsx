import { Link } from "react-router-dom";
import { MessageSquare, Settings, User, LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
    const { authUser, logout, isLoggingOut } = useAuthStore();

    return (
        <header className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg select-none">
            <div className="container mx-auto h-16 px-4">
                <div className="flex h-full items-center justify-between">
                    {/* LEFT */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 cursor-pointer">
                            <MessageSquare className="h-5 w-5 text-primary cursor-pointer" />
                        </div>
                        <span className="text-lg font-semibold cursor-pointer">Sampark</span>
                    </Link>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3 sm:gap-6 text-sm">
                        <Link
                            to="/settings"
                            className="flex items-center gap-1.5 text-base-content hover:text-primary transition-colors cursor-pointer"
                            title="Settings"
                        >
                            <Settings className="h-4 w-4 cursor-pointer" />
                            <span className="hidden sm:inline cursor-pointer">Settings</span>
                        </Link>
                        {authUser && (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-1.5 text-base-content hover:text-primary transition-colors cursor-pointer"
                                    title="Profile"
                                >
                                    <User className="h-4 w-4 cursor-pointer" />
                                    <span className="hidden sm:inline cursor-pointer">Profile</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    disabled={isLoggingOut}
                                    className="flex items-center gap-1.5 text-base-content hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                                    title="Logout"
                                >
                                    {isLoggingOut ? (
                                        <Loader2 className="h-4 w-4 animate-spin cursor-pointer" />
                                    ) : (
                                        <LogOut className="h-4 w-4 cursor-pointer" />
                                    )}
                                    <span className="hidden sm:inline cursor-pointer">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
