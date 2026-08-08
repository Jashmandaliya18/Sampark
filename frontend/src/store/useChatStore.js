import { create } from 'zustand';
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "../store/useAuthStore.js";

export const useChatStore = create((set, get) => ({
    message: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to get users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ message: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to get messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessages: async (messageData) => {
        const { selectedUser, message } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ message: [...message, res.data] });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    },

    reactToMessage: async (messageId, emoji) => {
        try {
            const res = await axiosInstance.put(`/messages/react/${messageId}`, { emoji });
            set({
                message: get().message.map((msg) =>
                    msg._id === messageId ? res.data : msg
                )
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update reaction");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Clean up any existing subscriptions first to prevent duplicates
        socket.off("newMessage");
        socket.off("messageReaction");

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = String(newMessage.senderId) === String(selectedUser._id);
            if (!isMessageSentFromSelectedUser) return;

            set({
                message: [...get().message, newMessage],
            });
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            set({
                message: get().message.map((msg) =>
                    msg._id === messageId ? { ...msg, reactions } : msg
                ),
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("messageReaction");
        }
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    }
}));