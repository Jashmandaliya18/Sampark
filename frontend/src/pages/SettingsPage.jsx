import { THEMES } from "../constants/index.js";
import { useThemeStore } from "../store/useThemeStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formateMessageTime } from "../lib/utils.js";

const DEFAULT_PREVIEW_MESSAGES = [
    { id: "1", text: "Hey! How's it going?", isSent: false, createdAt: new Date() },
    { id: "2", text: "I'm doing great! Just testing out the themes.", isSent: true, createdAt: new Date() },
];

const SettingsPage = () => {
    const { theme, setTheme } = useThemeStore();
    const { selectedUser, setSelectedUser, message, users } = useChatStore();
    const { authUser, onlineUsers } = useAuthStore();
    const navigate = useNavigate();

    // Determine preview user
    const previewUser = selectedUser || users[0] || { fullname: "John Doe", profilePic: "" };
    const isOnline = previewUser._id ? onlineUsers.map(String).includes(String(previewUser._id)) : true;

    // Determine preview messages
    const displayMessages = (message && message.length > 0)
        ? message.slice(-3).map((msg) => ({
            id: msg._id,
            text: msg.text || (msg.image ? "📷 Photo" : ""),
            isSent: String(msg.senderId) === String(authUser?._id),
            createdAt: msg.createdAt,
        }))
        : DEFAULT_PREVIEW_MESSAGES;

    const handleOpenChat = () => {
        if (previewUser._id) {
            setSelectedUser(previewUser);
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen container mx-auto px-4 pt-20 pb-10 max-w-5xl">
            {/* Back Button */}
            <button 
                onClick={() => navigate("/")} 
                className="flex items-center gap-2 btn btn-ghost btn-sm text-base-content/80 hover:text-base-content cursor-pointer mb-4"
                title="Back to Chat"
            >
                <ArrowLeft size={18} />
                <span>Back to Chat</span>
            </button>

            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-base-content">Theme Options</h2>
                    <p className="text-sm text-base-content/70">Choose a theme to customize your chat interface appearance</p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {THEMES.map((t) => (
                        <button 
                            key={t} 
                            className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors cursor-pointer ${
                                theme === t ? "bg-base-300 ring-2 ring-primary" : "hover:bg-base-200"
                            }`}
                            onClick={() => setTheme(t)}
                        >
                            <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                                    <div className="rounded bg-primary"></div>
                                    <div className="rounded bg-secondary"></div>
                                    <div className="rounded bg-accent"></div>
                                    <div className="rounded bg-neutral"></div>
                                </div>
                            </div>
                            <span className="text-[11px] font-medium truncate w-full text-center">
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Preview Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Live Interface Preview</h3>
                    <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-xl">
                        <div className="p-4 bg-base-200">
                            <div className="max-w-lg mx-auto">
                                {/* Mock Chat UI */}
                                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden border border-base-300">
                                    {/* Chat Header (Clickable to open user's real chat) */}
                                    <div 
                                        onClick={handleOpenChat}
                                        className="px-4 py-3 border-b border-base-300 bg-base-100 flex items-center justify-between cursor-pointer hover:bg-base-200/60 transition select-none"
                                        title="Click to open full conversation with this user"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-full overflow-hidden border border-base-300">
                                                <img 
                                                    src={previewUser.profilePic || "/avatar.png"} 
                                                    alt={previewUser.fullname} 
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-sm text-base-content hover:underline">{previewUser.fullname}</h3>
                                                <p className="text-xs text-base-content/60">
                                                    {isOnline ? "Online" : "Offline"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                            Click to open chat
                                        </span>
                                    </div>

                                    {/* Chat Messages Preview */}
                                    <div className="p-4 space-y-3 min-h-[220px] max-h-[220px] overflow-y-auto bg-base-100">
                                        {displayMessages.map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[80%] rounded-xl p-3 shadow-sm ${msg.isSent ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                                                    <p className="text-sm break-words">{msg.text}</p>
                                                    <p className={`text-[10px] mt-1.5 opacity-70 ${msg.isSent ? "text-primary-content" : "text-base-content"}`}>
                                                        {formateMessageTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input Preview */}
                                    <div className="p-3 border-t border-base-300 bg-base-100">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 text-sm h-10 bg-base-200"
                                                placeholder="This is a theme preview..."
                                                readOnly 
                                            />
                                            <button className="btn btn-primary h-10 min-h-0 btn-square">
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;