import { Link } from "react-router-dom";
import { MessageSquare, Settings, User, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();

    return (
        <header className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
            <div className="container mx-auto h-16 px-4">
                <div className="flex h-full items-center justify-between">
                    {/* LEFT */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg font-semibold">Sampark</span>
                    </Link>

                    {/* RIGHT */}
                    <div className="flex items-center gap-6 text-sm">
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 text-base-content hover:text-primary transition-colors">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                        {authUser && (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-base-content hover:text-primary transition-colors">
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 text-base-content hover:text-error transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
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
