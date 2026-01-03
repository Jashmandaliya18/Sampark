import { create } from 'zustand';
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "../store/useAuthStore.js"


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
        }
        finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessages: async (messageData) => {
        const { selectedUser, message } = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ message: [...message, res.data] })
        } catch (error) {
            toast.error(error.response.data.message || "Failed to get send messages");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({
                message: [...get().message, newMessage],
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: async (selectedUser) => {
        set({ selectedUser });
    }

}))