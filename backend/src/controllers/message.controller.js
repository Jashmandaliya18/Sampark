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
        const { id: userToChatId } = req.params

        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverid: userToChatId },
                { senderId: userToChatId, receiverid: myId }
            ]
        })
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
            const uploadResponce = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponce.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverid,
            text,
            image: imageUrl
        });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverid);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error while Sending Messages", error.message);
        res.status(500).json({ message: "Internal Server Error while Sending Messages" });

    }
}

