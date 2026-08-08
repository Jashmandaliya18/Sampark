import { User } from "../models/user.model.js"
import { Message } from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error get Users for Sidebar", error.message);
        res.status(500).json({ message: "Internal Server Error while getUsersForSidebar" })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverid: userToChatId },
                { senderId: userToChatId, receiverid: myId }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error to Get Messages", error.message);
        res.status(500).json({ message: "Internal Server Error while Get Messages" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverid } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverid,
            text,
            image: imageUrl
        });
        await newMessage.save();

        const receiverSocketIds = getReceiverSocketId(receiverid);
        if (Array.isArray(receiverSocketIds)) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        } else if (receiverSocketIds) {
            io.to(receiverSocketIds).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error while Sending Messages", error.message);
        res.status(500).json({ message: "Internal Server Error while Sending Messages" });
    }
}

export const reactToMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.reactions) {
            message.reactions = [];
        }

        // Find existing reaction by current user
        const existingIndex = message.reactions.findIndex(
            (r) => String(r.userId) === String(userId)
        );

        if (!emoji || emoji === "❌") {
            // Remove reaction
            if (existingIndex > -1) {
                message.reactions.splice(existingIndex, 1);
            }
        } else if (existingIndex > -1) {
            if (message.reactions[existingIndex].emoji === emoji) {
                // Toggle off if same emoji clicked again
                message.reactions.splice(existingIndex, 1);
            } else {
                // Change emoji
                message.reactions[existingIndex].emoji = emoji;
            }
        } else {
            // Add new reaction
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        // Emit socket event to both receiver and sender
        const receiverSockets = getReceiverSocketId(message.receiverid);
        const senderSockets = getReceiverSocketId(message.senderId);
        const targetSockets = [...new Set([...receiverSockets, ...senderSockets])];

        targetSockets.forEach((socketId) => {
            io.to(socketId).emit("messageReaction", {
                messageId: message._id,
                reactions: message.reactions,
            });
        });

        res.status(200).json(message);

    } catch (error) {
        console.log("Error in reactToMessage:", error.message);
        res.status(500).json({ message: "Internal Server Error while Reacting to Message" });
    }
}
