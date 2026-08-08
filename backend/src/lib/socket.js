import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "https://sampark-1.onrender.com",
            "https://sampark-2.onrender.com"
        ],
        credentials: true,
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[String(userId)];
}

// Map to store online users: { userId: socketId }
const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined" && userId !== "null") {
        userSocketMap[String(userId)] = socket.id;
    }

    // Broadcast online user IDs to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (userId && userId !== "undefined") {
            delete userSocketMap[String(userId)];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };